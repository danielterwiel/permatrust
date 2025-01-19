use crate::traits::pagination::{Filterable, Sortable};

use crate::types::errors::AppError;

use crate::types::pagination::{
    FilterCriteria, PageNumber, PageSize, PaginationMetadata, SortCriteria, TotalItems,
};
use crate::utils::filter::filter;
use crate::utils::sort::sort;

const ALLOWED_PAGE_SIZES: [u8; 4] = [1, 10, 25, 50];

pub fn paginate<T: Clone + Filterable + Sortable>(
    items: &[T],
    page_size: PageSize,
    page_number: PageNumber,
    filters: Option<Vec<FilterCriteria>>,
    sorting: Option<SortCriteria>,
) -> Result<(Vec<T>, PaginationMetadata), AppError> {
    let items = match filters {
        Some(ref f) => filter(items, f.clone()),
        None => items.to_vec(),
    };
    let items = match sorting {
        Some(ref s) => {
            let mut items_copy = items.clone();
            sort(&mut items_copy, s.clone())
        }
        None => items,
    };
    let total_items = items.len() as TotalItems;

    if !ALLOWED_PAGE_SIZES.contains(&page_size) {
        return Err(AppError::InvalidPageSize(
            "Page size cannot be any other value than 1, 10, 25 or 50".to_string(),
        ));
    }

    let total_pages = if total_items == 0 {
        1
    } else {
        total_items.div_ceil(page_size as TotalItems)
    };

    if page_number < 1 || page_number > total_pages as PageNumber {
        return Err(AppError::InvalidPageNumber(
            "Page number out of bounds".to_string(),
        ));
    }

    let start_index = ((page_number - 1) * page_size) as usize;
    let end_index = (start_index + page_size as usize).min(total_items as usize);

    let paginated_items = items[start_index..end_index].to_vec();

    let pagination_metadata = PaginationMetadata {
        page_size,
        total_pages: total_pages as PageNumber,
        total_items,
        page_number,
        has_next_page: page_number < total_pages as PageNumber,
        has_previous_page: page_number > 1,
    };

    Ok((paginated_items, pagination_metadata))
}
