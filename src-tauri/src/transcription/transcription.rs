use std::path::PathBuf;
use std::thread;

use crate::transcription::audio_prep;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

pub fn spawn_transcription_thread(file_path: PathBuf) {
    thread::spawn(move || {
        let model_path = "resources/ggml-base.en.bin";

        let samples = match audio_prep::convert_audio(&file_path) {
            Ok(samples) => samples,
            Err(err) => {
                eprintln!(
                    "Error loading audio file '{}': {}",
                    file_path.display(),
                    err
                );
                return;
            }
        };

        let ctx = WhisperContext::new_with_params(&model_path, WhisperContextParameters::default())
            .expect("failed to load model");

        let mut state = ctx.create_state().expect("failed to create state");

        let mut params = FullParams::new(SamplingStrategy::BeamSearch {
            beam_size: 5,
            patience: -1.0,
        });

        params.set_language(Some("en"));

        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);

        // now we can run the model
        state
            .full(params, &samples[..])
            .expect("failed to run model");

        // fetch the results
        for segment in state.as_iter() {
            println!(
                "[{} - {}]: {}",
                // these timestamps are in centiseconds (10s of milliseconds)
                segment.start_timestamp(),
                segment.end_timestamp(),
                // this default Display implementation will result in any invalid UTF-8
                // being converted into the Unicode replacement character, U+FFFD
                segment
            );
        }
    });
}
