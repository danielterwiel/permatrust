use super::state;
use super::*;
use crate::users::methods::get_user_by_principal;
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, ListDocumentsInput, ListDocumentsResult,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;
use shared::{log_debug, log_error, log_info, log_warn};

#[ic_cdk_macros::update]
pub fn create_document(input: CreateDocumentInput) -> CreateDocumentResult {
    let document_id = state::get_next_id();
    let principal = ic_cdk::api::msg_caller();

    log_debug!(
        "auth_check: Document creation attempt [principal={}, title='{}', project_id={}]",
        principal,
        input.title,
        input.project_id
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking document creation permissions [principal={}, project_id={}]",
    //           principal, input.project_id);

    log_info!(
        "document_creation: Starting creation [title='{}', project_id={}, principal={}]",
        input.title,
        input.project_id,
        principal
    );

    log_debug!(
        "auth_check: Validating user for document creation [principal={}]",
        principal
    );

    let user = match get_user_by_principal(principal) {
        GetUserResult::Ok(u) => {
            log_info!("auth_check: Authentication successful for document creation [user_id={}, principal={}]", u.id, principal);
            log_debug!(
                "document_creation: User validated [user_id={}, principal={}]",
                u.id,
                principal
            );
            u
        }
        GetUserResult::Err(error) => {
            log_warn!(
                "auth_check: Authentication failed for document creation [principal={}] - {:?}",
                principal,
                error
            );
            log_error!(
                "document_creation: User validation failed [principal={}] - {:?}",
                principal,
                error
            );
            return CreateDocumentResult::Err(error);
        }
    };

    let document = Document {
        id: document_id,
        title: input.title,
        version: 0,
        revisions: Vec::new(),
        created_by: user.id,
        created_at: ic_cdk::api::time(),
        project_id: input.project_id,
    };

    state::insert(document_id, document.clone());
    log_debug!(
        "document_creation: Document entity created [id={}, title='{}']",
        document_id,
        document.title
    );

    log_info!(
        "document_creation: Successfully created document [id={}, title='{}', user_id={}, principal={}, project_id={}, timestamp={}]",
        document_id, document.title, user.id, principal, input.project_id, document.created_at
    );
    CreateDocumentResult::Ok(document_id)
}

#[ic_cdk_macros::query]
pub fn list_documents(input: ListDocumentsInput) -> ListDocumentsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Document listing attempt [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking document listing permissions [principal={}]", principal);

    log_debug!(
        "document_listing: Processing request [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    let documents = state::get_all();
    log_debug!(
        "document_access: Retrieved documents [principal={}, total_count={}]",
        principal,
        documents.len()
    );
    log_debug!(
        "document_listing: Retrieved documents [total_count={}]",
        documents.len()
    );

    match paginate(
        &documents,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => {
            log_info!(
                "document_listing: Listed documents [principal={}, page_items={}, total={}]",
                principal,
                result.0.len(),
                documents.len()
            );
            log_debug!(
                "document_listing: Paginated results [page_items={}, total={}]",
                result.0.len(),
                documents.len()
            );
            ListDocumentsResult::Ok(result)
        }
        Err(e) => {
            log_error!(
                "document_access: Document listing failed [principal={}] - {:?}",
                principal,
                e
            );
            log_warn!(
                "document_listing: Pagination failed [principal={}] - {:?}",
                principal,
                e
            );
            ListDocumentsResult::Err(e)
        }
    }
}
