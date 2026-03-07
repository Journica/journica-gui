use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn recordings_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|path| path.join("recordings"))
        .map_err(|e| e.to_string())
}
