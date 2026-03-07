use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct RecordingInfo {
    pub id: String,
    pub filename: String,
    pub created_at: i64,
}
