use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};
use tauri::Manager;

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
