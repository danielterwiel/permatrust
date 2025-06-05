use candid::CandidType;
use serde::Deserialize;

// TODO: make this a 2-dimensional enum to allow for more specific error handling
// Something like:
// pub enum ErrorType {
//        BadRequest(BadRequestError),
//        NotFound(NotFoundError),
//        RateLimit(RateLimitError),
//        InvalidInput(InvalidInputError),
//        Unauthorized(UnauthorizedError),
//        Validation(ValidationError),
// }
// pub enum ErrorSurface {
//        Api(ApiError),
//        Auth(AuthError),
//        Management(ManagementError),
//        Shared(SharedError),
//        Tenant(TenantError),
// }
// This way we can keep the number of
// errors manageable while still providing
// enough context for each error type.

#[derive(CandidType, Deserialize, Debug)]
pub enum AppError {
    EntityNotFound(String),
    IdentityNotFound,
    InternalError(String),
    InvalidInput(String),
    InvalidPageNumber(String),
    InvalidPageSize(String),
    InvalidStateTransition(String),
    SpawnCanister(String),
    CanisterUpgradeFailed(String),
    StoreWasmModuleFailed(String),
    GetAllWasmVersionsFailed(String),
    Unauthorized,
    ValidationError(String),
    UpdateFailed(String),
}
