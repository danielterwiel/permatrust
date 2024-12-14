use crate::traits::pagination::Sortable;
use crate::types::pagination::SortCriteria;

pub fn sort<T: Clone + Sortable>(items: &mut [T], sort_criteria: SortCriteria) -> Vec<T> {
    items.sort_by(|a, b| a.compare(b, &sort_criteria));
    items.to_vec()
}
