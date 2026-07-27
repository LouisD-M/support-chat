use serde::Serialize;
use std::{
    env,
    process::Command,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DeviceIdentity {
    computer_name: String,
    domain: Option<String>,
    last_windows_user: Option<String>,

    os_name: Option<String>,
    os_version: Option<String>,
    ip_address: Option<String>,
    manufacturer: Option<String>,
    model: Option<String>,
    serial_number: Option<String>,
}

fn run_powershell(command: &str) -> Option<String> {
    let mut powershell = Command::new("powershell.exe");

    powershell.args([
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-Command",
        command,
    ]);

    #[cfg(target_os = "windows")]
    powershell.creation_flags(CREATE_NO_WINDOW);

    let output = powershell
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let value = String::from_utf8_lossy(
        &output.stdout,
    )
    .trim()
    .to_string();

    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}
#[tauri::command]
fn get_device_identity() -> DeviceIdentity {
    let os_name = run_powershell(
        "(Get-CimInstance Win32_OperatingSystem).Caption",
    );

    let os_version = run_powershell(
        "(Get-CimInstance Win32_OperatingSystem).Version",
    );

    let manufacturer = run_powershell(
        "(Get-CimInstance Win32_ComputerSystem).Manufacturer",
    );

    let model = run_powershell(
        "(Get-CimInstance Win32_ComputerSystem).Model",
    );

    let serial_number = run_powershell(
        "(Get-CimInstance Win32_BIOS).SerialNumber",
    );

    let ip_address = run_powershell(
        r#"
        Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -ne "127.0.0.1" -and
            $_.AddressState -eq "Preferred" -and
            $_.InterfaceAlias -notmatch "Loopback|Bluetooth|vEthernet"
        } |
        Select-Object -ExpandProperty IPAddress -First 1
        "#,
    );

    DeviceIdentity {
        computer_name: env::var(
            "COMPUTERNAME",
        )
        .unwrap_or_else(|_| {
            "POSTE-INCONNU".to_string()
        }),

        domain: env::var(
            "USERDOMAIN",
        )
        .ok(),

        last_windows_user: env::var(
            "USERNAME",
        )
        .ok(),

        os_name,
        os_version,
        ip_address,
        manufacturer,
        model,
        serial_number,
    }
}

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(
                            log::LevelFilter::Info,
                        )
                        .build(),
                )?;
            }

            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                get_device_identity
            ],
        )
        .run(
            tauri::generate_context!(),
        )
        .expect(
            "error while running tauri application",
        );
}