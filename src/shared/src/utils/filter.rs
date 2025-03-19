use crate::traits::pagination::Filterable;
use crate::types::pagination::FilterCriteria;

pub fn filter<T: Clone + Filterable>(items: &[T], filters: Vec<FilterCriteria>) -> Vec<T> {
    items
        .iter()
        .filter(|&item| {
            let matches_all = filters.iter().all(|criteria| item.matches(criteria));
            matches_all
        })
        .cloned()
        .collect()
}
