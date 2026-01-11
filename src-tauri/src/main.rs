use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running app");
}
