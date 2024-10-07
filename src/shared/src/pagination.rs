use crate::pt_backend_generated::{
    AppError, Document, Organisation, PageNumber, PageSize, PaginationMetadata, Project, Revision,
    TotalItems, User,
};
use candid::{self, CandidType, Deserialize};

pub type PaginatedUsersResult = PaginatedResult<User>;
pub type PaginatedOrganisationsResult = PaginatedResult<Organisation>;
pub type PaginatedProjectsResult = PaginatedResult<Project>;
pub type PaginatedDocumentsResult = PaginatedResult<Document>;
pub type PaginatedRevisionsResult = PaginatedResult<Revision>;

#[derive(CandidType, Deserialize)]
pub enum PaginatedResult<T> {
    Ok(Vec<T>, PaginationMetadata),
    Err(AppError),
}

const ALLOWED_PAGE_SIZES: [u64; 3] = [10, 25, 50];

pub fn paginate<T: Clone>(
    items: &[T],
    page_size: PageSize,
    page_number: PageNumber,
) -> Result<(Vec<T>, PaginationMetadata), AppError> {
    let total_items = items.len() as TotalItems;

    if !ALLOWED_PAGE_SIZES.contains(&page_size) {
        return Err(AppError::InvalidPageSize(
            "Page size cannot be any other value than 10, 20 or 50".to_string(),
        ));
    }

    // Calculate total_pages using ceiling division
    let total_pages = if total_items == 0 {
        1 // Consider at least one page when there are no items
    } else {
        (total_items + page_size - 1) / page_size
    };

    // Validate page_number
    if page_number < 1 || page_number > total_pages {
        return Err(AppError::InvalidPageNumber(
            "Page number out of bounds".to_string(),
        ));
    }

    // Calculate start and end indices for slicing the items slice
    let start_index = ((page_number - 1) * page_size) as usize;
    let end_index = ((start_index as TotalItems + page_size).min(total_items)) as usize;

    // Slice the items slice to get the items for the requested page
    let paginated_items = if start_index >= items.len() {
        vec![]
    } else {
        items[start_index..end_index].to_vec()
    };

    // Determine has_next_page and has_previous_page
    let has_next_page = page_number < total_pages;
    let has_previous_page = page_number > 1;

    // Create pagination metadata
    let pagination_metadata = PaginationMetadata {
        page_size,
        total_pages,
        total_items,
        page_number,
        has_next_page,
        has_previous_page,
    };

    Ok((paginated_items, pagination_metadata))
}
