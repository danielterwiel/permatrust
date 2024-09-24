use candid;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;

type DocumentId = u64;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Document {
    id: DocumentId,
    title: String,
    content: Vec<u8>,
    version: u32,
    timestamp: u64,
    author: Principal,
}

thread_local! {
    static DOCUMENTS: RefCell<HashMap<DocumentId, Document>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<DocumentId> = RefCell::new(0);
}

#[init]
fn init() {
    // Initialization logic, if needed
}

#[update]
fn create_document(title: String, content: Vec<u8>) -> DocumentId {
    let caller = ic_cdk::caller();
    let id = NEXT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() += 1;
        current_id
    });

    let document = Document {
        id,
        title,
        content,
        version: 1,
        timestamp: ic_cdk::api::time(),
        author: caller,
    };

    DOCUMENTS.with(|documents| {
        documents.borrow_mut().insert(id, document);
    });

    id
}

#[query]
fn get_document(id: DocumentId) -> Option<Document> {
    DOCUMENTS.with(|documents| documents.borrow().get(&id).cloned())
}

#[update]
fn update_document(
    id: DocumentId,
    title: Option<String>,
    content: Option<Vec<u8>>,
) -> Result<(), String> {
    let caller = ic_cdk::caller();

    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();
        if let Some(doc) = documents.get_mut(&id) {
            if doc.author != caller {
                return Err("Only the author can update the document".to_string());
            }

            if let Some(new_title) = title {
                doc.title = new_title;
            }
            if let Some(new_content) = content {
                doc.content = new_content;
            }
            doc.version += 1;
            doc.timestamp = ic_cdk::api::time();
            Ok(())
        } else {
            Err("Document not found".to_string())
        }
    })
}

#[update]
fn delete_document(id: DocumentId) -> Result<(), String> {
    let caller = ic_cdk::caller();

    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();
        if let Some(doc) = documents.get(&id) {
            if doc.author != caller {
                return Err("Only the author can delete the document".to_string());
            }
            documents.remove(&id);
            Ok(())
        } else {
            Err("Document not found".to_string())
        }
    })
}

#[query]
fn list_documents() -> Vec<Document> {
    DOCUMENTS.with(|documents| documents.borrow().values().cloned().collect())
}

// Export the Candid interface
ic_cdk::export_candid!();
