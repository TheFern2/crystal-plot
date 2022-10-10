use std::collections::HashMap;
use plctag::RawTag;


#[derive(PartialEq, serde::Serialize, serde::Deserialize)]
pub enum EipTagType {
    Bool,
    Real
}

#[derive(Debug)]
pub enum EipPlcError {
    NotInitialized,
    CommunicationLoss
}

pub enum TagResult {
    Bool(u8),
    Real(f32),
    None
}

// this could use tag_name, maybe
#[derive(serde::Serialize, serde::Deserialize)]
struct EipTag {
    raw_tag: RawTag,
    tag_type: EipTagType
}

impl EipTag {
    pub fn new(raw_tag: RawTag, tag_type: EipTagType) -> EipTag {
        EipTag {
            raw_tag,
            tag_type
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct EipPlc {
    timeout: u32,
    path: String,
    tags: HashMap<String, EipTag>
}

impl EipPlc {
    pub fn new(timeout: u32, path: String) -> EipPlc {
        let mut tags: HashMap<String, EipTag> = HashMap::new();
        EipPlc {
            timeout,
            path,
            tags
        }
    }

    pub fn add_tag(&mut self, tag_name: String, tag_type: EipTagType) {

        let tag_path = format!("{}{}", self.path, tag_name);
        let raw_tag = RawTag::new(tag_path, self.timeout).unwrap();
        let eip_tag = EipTag::new(raw_tag, tag_type);
        self.tags.insert(tag_name, eip_tag);
    }

    pub fn read_tag(&mut self, tag_name: String) -> TagResult {
        let tag = self.tags.get(&tag_name).unwrap();
        if tag.tag_type == EipTagType::Bool {
            let status = tag.raw_tag.read(self.timeout);
            assert!(status.is_ok());
            let value: u8 = tag.raw_tag.get_u8(0).unwrap();
            return TagResult::Bool(value);
        }

        if tag.tag_type == EipTagType::Real {
            let status = tag.raw_tag.read(self.timeout);
            assert!(status.is_ok());
            let value: f32 = tag.raw_tag.get_f32(0).unwrap();
            return TagResult::Real(value);
        }

        TagResult::None
    }

    // the return of this function should be bool or error if tag doesn't exist
    pub fn read_bool(&mut self, tag_name: String) -> bool {
        let tag = self.tags.get(&tag_name).unwrap();
        let status = tag.raw_tag.read(self.timeout);
        assert!(status.is_ok());
        let value: u8 = tag.raw_tag.get_u8(0).unwrap();
        // println!("{}", value);

        if value > 0 {
            true
        } else {
            false
        }
    }

    pub fn read_real(&mut self, tag_name: String) -> f32 {
        let tag = self.tags.get(&tag_name).unwrap();
        let status = tag.raw_tag.read(self.timeout);
        assert!(status.is_ok());
        let value: f32 = tag.raw_tag.get_f32(0).unwrap();
        // println!("{}", value);
        return value
    }

    pub fn read_test(&mut self, tag_name: String) -> Result<bool, EipPlcError> {
        let tag = self.tags.get(&tag_name);

        match tag {
            None => println!("Doesn't exists"),
            Some(tag) => {
                println!("Exists");
                return Ok(true);
            }
        }

        Err(EipPlcError::NotInitialized)
    }
}
