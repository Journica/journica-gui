use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct RecordingInfo {
    pub id: String,
    pub storage_path: String,
    pub display_name: String,
    pub created_at: i64,
}
