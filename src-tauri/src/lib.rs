mod commands;
use std::{sync::{Mutex, mpsc::{self, Sender}}, thread};

pub enum AudioCommand {
    Start, 
    Stop
}

pub struct AppState {
    command_tx: Sender<AudioCommand>
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (tx, rx) = mpsc::channel::<AudioCommand>();

    thread::spawn(move || {
        let mut stream: Option<cpal::Stream> = None;

        match rx.recv() {
            Ok(AudioCommand::Start) => {
                println!("Start recording...");
            },
            Ok(AudioCommand::Stop) => {
                println!("Stop recording...");
                stream = None;
            },
            Err(_) => {
                println!("Channel closed.");
            }
        }
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState {
            command_tx: tx
        }))
        .invoke_handler(tauri::generate_handler![commands::start_recording, commands::stop_recording])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
