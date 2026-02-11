use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};
use tauri::Manager;

fn tokenize_query(query: &str) -> Vec<String> {
    query
        .split(|c: char| !c.is_alphanumeric())
        .map(|token| token.to_lowercase())
        .filter(|token| !token.is_empty())
        .collect()
}

fn build_fts_query(terms: &[String]) -> Option<String> {
    if terms.is_empty() {
        return None;
    }

    Some(
        terms
            .iter()
            .map(|token| format!("{}*", token))
            .collect::<Vec<_>>()
            .join(" AND "),
    )
}

#[tauri::command]
pub fn get_recording_path(filename: String, app: tauri::AppHandle) -> Result<String, String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("recordings")
        .join(&filename);

    path.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid path".to_string())
}

#[derive(Clone, Serialize, Deserialize, FromRow)]
pub struct Entry {
    pub id: String,
    pub filename: String,
    pub created_at: i64,
    pub duration_seconds: Option<f64>,
    pub transcript: Option<String>,
    pub title: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, FromRow)]
pub struct TranscriptSegment {

}

#[tauri::command]
pub async fn get_transcript_segments(entry_id: String) {

}

#[tauri::command]
pub async fn get_segment_at_time(entry_id: String, time_ms: i64) {
}

#[tauri::command]
pub async fn get_entries(pool: tauri::State<'_, SqlitePool>) -> Result<Vec<Entry>, String> {
    let entries = sqlx::query_as::<_, Entry>(
        "SELECT id, filename, created_at, duration_seconds, transcript, title FROM entries ORDER BY created_at DESC"
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(entries)
}

#[tauri::command]
pub async fn query_entries(
    pool: tauri::State<'_, SqlitePool>,
    query: Option<String>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Entry>, String> {
    let safe_limit = limit.clamp(1, 500);
    let safe_offset = offset.max(0);
    let trimmed_query = query.unwrap_or_default().trim().to_string();

    if trimmed_query.is_empty() {
        let entries = sqlx::query_as::<_, Entry>(
            "SELECT id, filename, created_at, duration_seconds, transcript, title FROM entries ORDER BY created_at DESC LIMIT ? OFFSET ?",
        )
        .bind(safe_limit)
        .bind(safe_offset)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

        return Ok(entries);
    }

    let terms = tokenize_query(&trimmed_query);

    let Some(fts_query) = build_fts_query(&terms) else {
        return Ok(Vec::new());
    };

    let entries = sqlx::query_as::<_, Entry>(
        "SELECT e.id, e.filename, e.created_at, e.duration_seconds, e.transcript, e.title
         FROM entries e
         JOIN entries_fts ON entries_fts.rowid = e.rowid
         WHERE entries_fts MATCH ?
         ORDER BY bm25(entries_fts), e.created_at DESC
         LIMIT ? OFFSET ?",
    )
    .bind(fts_query)
    .bind(safe_limit)
    .bind(safe_offset)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    if !entries.is_empty() {
        return Ok(entries);
    }

    let mut fallback_sql = String::from(
        "SELECT id, filename, created_at, duration_seconds, transcript, title FROM entries WHERE ",
    );

    for (index, _) in terms.iter().enumerate() {
        if index > 0 {
            fallback_sql.push_str(" AND ");
        }

        fallback_sql.push_str(
            "(LOWER(COALESCE(title, '')) LIKE LOWER(?) OR LOWER(filename) LIKE LOWER(?) OR LOWER(COALESCE(transcript, '')) LIKE LOWER(?))",
        );
    }

    fallback_sql.push_str(" ORDER BY created_at DESC LIMIT ? OFFSET ?");

    let mut fallback_query = sqlx::query_as::<_, Entry>(&fallback_sql);

    for term in &terms {
        let like_pattern = format!("%{}%", term);
        fallback_query = fallback_query
            .bind(like_pattern.clone())
            .bind(like_pattern.clone())
            .bind(like_pattern);
    }

    let fallback_entries = fallback_query
        .bind(safe_limit)
        .bind(safe_offset)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(fallback_entries)
}

#[tauri::command]
pub async fn delete_entry(
    id: String,
    app: tauri::AppHandle,
    pool: tauri::State<'_, SqlitePool>,
) -> Result<(), String> {
    let entry = sqlx::query_as::<_, Entry>(
        "SELECT id, filename, created_at, duration_seconds, transcript, title FROM entries WHERE id = ?"
    )
    .bind(&id)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    if let Some(entry) = entry {
        let file_path = app
            .path()
            .app_data_dir()
            .map_err(|e| e.to_string())?
            .join("recordings")
            .join(&entry.filename);

        if file_path.exists() {
            std::fs::remove_file(&file_path).map_err(|e| e.to_string())?;
        }

        sqlx::query("DELETE FROM entries WHERE id = ?")
            .bind(&id)
            .execute(pool.inner())
            .await
            .map_err(|e| e.to_string())?;

        println!("Deleted entry: {}", id);
    }

    Ok(())
}
