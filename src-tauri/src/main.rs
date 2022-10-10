#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod eip_plc;

use std::sync::Mutex;
use eip_plc::{EipPlc, EipTagType};

#[derive(serde::Serialize, serde::Deserialize)]
struct MyState(Mutex<EipPlc>);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

/*#[tauri::command]
fn read_bool(tag: &str) ->  String {
  let timeout = 100;//ms
  let path="protocol=ab-eip&plc=controllogix&path=1,1&gateway=192.168.1.14&name=BaseBOOL&elem_count=1&elem_size=1";// YOUR TAG DEFINITION
  let tag = RawTag::new(path, timeout).unwrap();
  let status = tag.read(timeout);
  assert!(status.is_ok());
  let value: u8 = tag.get_value(0).unwrap();

  return if value > 0 {
    String::from("PLC BaseBOOL tag: true")
  } else {
    String::from("PLC BaseBOOL tag: false")
  }
}*/

#[tauri::command]
fn init_plc(plc: tauri::State<MyState>) {
  // let path="protocol=ab-eip&plc=controllogix&path=1,1&gateway=192.168.1.14&name=".to_string();
  // let mut plc = &mut EipPlc::new(100, path);
  // plc.add_tag("BaseBOOL".to_string(), EipTagType::Bool);

  // plc.add_tag("BaseREAL".to_string(), EipTagType::Real);

  plc.0.lock().unwrap().add_tag("BaseREAL".to_string(), EipTagType::Real);

  //plc.add_tag("BaseREAL".to_string(), EipTagType::Real);
}

#[tauri::command]
fn read_bool(plc: tauri::State<MyState>, tag: &str) -> bool {
  let value = plc.0.lock().unwrap().read_bool(tag.to_string());

  return value
}

fn main() {

  let path="protocol=ab-eip&plc=controllogix&path=1,1&gateway=192.168.1.14&name=".to_string();
  let mut plc = EipPlc::new(100, path);
  plc.add_tag("BaseBOOL".to_string(), EipTagType::Bool);

  tauri::Builder::default()
      .manage(MyState(Mutex::from(plc)))
      .invoke_handler(tauri::generate_handler![greet, init_plc, read_bool])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
