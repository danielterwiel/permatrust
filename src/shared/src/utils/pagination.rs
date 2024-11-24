use crate::traits::pagination::{Filterable, Sortable};

use crate::types::errors::AppError;

use crate::types::pagination::{
    FilterCriteria, PageNumber, PageSize, PaginationMetadata, SortCriteria, TotalItems,
};

const ALLOWED_PAGE_SIZES: [u8; 4] = [1, 10, 25, 50];

pub fn paginate<T: Clone + Filterable + Sortable>(
    items: &[T],
    page_size: PageSize,
    page_number: PageNumber,
    filters: Option<Vec<FilterCriteria>>,
    sort: Option<SortCriteria>,
) -> Result<(Vec<T>, PaginationMetadata), AppError> {
    // Apply filters
    let filtered_items: Vec<T> = if let Some(filter_criteria) = filters {
        items
            .iter()
            .cloned()
            .filter(|item| {
                filter_criteria
                    .iter()
                    .all(|criteria| item.matches(criteria))
            })
            .collect()
    } else {
        items.to_vec()
    };

    // Apply sorting
    let mut sorted_items = filtered_items;
    if let Some(sort_criteria) = sort {
        sorted_items.sort_by(|a, b| a.compare(b, &sort_criteria));
    }

    let total_items = sorted_items.len() as TotalItems;

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

    // Calculate start and end indices for slicing the sorted_items
    let start_index = ((page_number - 1) * page_size) as usize;
    let end_index = ((start_index as TotalItems + page_size).min(total_items)) as usize;

    // Slice the sorted_items to get the items for the requested page
    let paginated_items = if start_index >= sorted_items.len() {
        vec![]
    } else {
        sorted_items[start_index..end_index].to_vec()
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
