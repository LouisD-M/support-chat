use serde::Serialize;
use std::env;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DeviceIdentity {
    computer_name: String,
    domain: Option<String>,
    last_windows_user: Option<String>,
}

#[tauri::command]
fn get_device_identity() -> DeviceIdentity {
    DeviceIdentity {
        computer_name: env::var("COMPUTERNAME")
            .unwrap_or_else(|_| "POSTE-INCONNU".to_string()),

        domain: env::var("USERDOMAIN").ok(),

        last_windows_user: env::var("USERNAME").ok(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_identity
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}