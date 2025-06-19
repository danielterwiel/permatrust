use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};

use shared::types::errors::AppError;
use shared::types::pagination::PaginationInput;
use shared::types::projects::{
    CreateInitProjectInput, CreateProjectInput, CreateProjectResult, ListProjectMembersInput,
    ListProjectMembersResult, ListProjectsResult, Project, ProjectId,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;

use crate::users::user_manager::UserManager;
use shared::utils::logs::loggable_project;
use shared::{log_debug, log_error, log_info, log_warn};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static PROJECTS: RefCell<StableBTreeMap<ProjectId, Project, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(memory_ids::tenant_canister::PROJECTS_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU32 = const { AtomicU32::new(0) };
}

pub struct ProjectsManager;

impl ProjectsManager {
    fn get_next_id() -> ProjectId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    fn get_all() -> Vec<Project> {
        PROJECTS.with(|projects| {
            projects
                .borrow()
                .iter()
                .map(|(_, project)| project.clone())
                .collect()
        })
    }

    fn insert(id: ProjectId, project: Project) {
        PROJECTS.with(|projects| {
            projects.borrow_mut().insert(id, project);
        });
    }

    pub fn create_init_project(input: CreateInitProjectInput) -> CreateProjectResult {
        log_debug!(
            "project_creation: Initial project creation [name='{}', created_by={}, member_count={}]",
            input.name,
            input.created_by,
            input.members.len()
        );

        if input.name.trim().is_empty() {
            log_warn!(
                "project_creation: Validation failed - empty name [created_by={}]",
                input.created_by
            );
            return CreateProjectResult::Err(AppError::InternalError(
                "Project name cannot be empty".to_string(),
            ));
        }
        let id = Self::get_next_id();
        let project = Project {
            id,
            name: input.name,
            members: input.members,
            created_at: ic_cdk::api::time(),
            created_by: input.created_by,
            documents: vec![],
        };
        Self::insert(id, project.clone());
        log_info!("project_creation: Successfully created initial project [id={}, name='{}', created_by={}, member_count={}, timestamp={}]",
                 project.id, project.name, project.created_by, project.members.len(), project.created_at);

        CreateProjectResult::Ok(id)
    }

    pub fn create_project(input: CreateProjectInput) -> CreateProjectResult {
        let caller = ic_cdk::api::msg_caller();
        log_debug!(
            "auth_check: Project creation attempt [principal={}, name='{}']",
            caller,
            input.name
        );

        if input.name.trim().is_empty() {
            log_warn!(
                "project_creation: Validation failed - empty name [principal={}]",
                caller
            );
            return CreateProjectResult::Err(AppError::InternalError(
                "Project name cannot be empty".to_string(),
            ));
        }

        log_debug!(
            "auth_check: Validating user for project creation [principal={}]",
            caller
        );
        let user = match UserManager::get_user_by_principal(caller) {
            GetUserResult::Ok(u) => {
                log_debug!(
                    "auth_check: User validated for project creation [user_id={}, principal={}]",
                    u.id,
                    caller
                );
                u
            }
            GetUserResult::Err(e) => {
                log_warn!(
                    "auth_check: Authentication failed for project creation [principal={}] - {:?}",
                    caller,
                    e
                );
                return CreateProjectResult::Err(e);
            }
        };

        let id = Self::get_next_id();
        let project = Project {
            id,
            name: input.name,
            members: vec![user.id],
            created_at: ic_cdk::api::time(),
            created_by: user.id,
            documents: vec![],
        };

        Self::insert(id, project.clone());
        log_info!(
            "project_creation: Created {} [principal={}]",
            loggable_project(&project),
            caller
        );

        CreateProjectResult::Ok(id)
    }

    pub fn list_projects(pagination: PaginationInput) -> ListProjectsResult {
        let principal = ic_cdk::api::msg_caller();
        log_debug!(
            "auth_check: Project listing attempt [principal={}, page={}, size={}]",
            principal,
            pagination.page_number,
            pagination.page_size
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking project listing permissions [principal={}]", principal);

        let projects = Self::get_all();
        log_debug!(
            "project_access: Retrieved projects [principal={}, total_count={}]",
            principal,
            projects.len()
        );

        match paginate(
            &projects,
            pagination.page_size,
            pagination.page_number,
            pagination.filters,
            pagination.sort,
        ) {
            Ok(result) => {
                log_debug!(
                    "project_access: Paginated project results [principal={}, page_items={}, total={}]",
                    principal,
                    result.0.len(),
                    projects.len()
                );
                ListProjectsResult::Ok(result)
            }
            Err(e) => {
                log_error!(
                    "project_access: Pagination failed [principal={}] - {:?}",
                    principal,
                    e
                );
                ListProjectsResult::Err(e)
            }
        }
    }

    pub fn list_project_members(input: ListProjectMembersInput) -> ListProjectMembersResult {
        let principal = ic_cdk::api::msg_caller();
        log_debug!(
            "auth_check: Project members listing attempt [principal={}, page={}, size={}]",
            principal,
            input.pagination.page_number,
            input.pagination.page_size
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking project member access permissions [principal={}]", principal);

        let all_users = UserManager::get_all();
        log_debug!(
            "project_access: Retrieved project members [principal={}, total_users={}]",
            principal,
            all_users.len()
        );

        match paginate(
            &all_users,
            input.pagination.page_size,
            input.pagination.page_number,
            input.pagination.filters,
            input.pagination.sort,
        ) {
            Ok(result) => {
                log_debug!(
                    "project_access: Paginated member results [principal={}, page_items={}, total={}]",
                    principal,
                    result.0.len(),
                    all_users.len()
                );
                ListProjectMembersResult::Ok(result)
            }
            Err(e) => {
                log_error!(
                    "project_access: Member pagination failed [principal={}] - {:?}",
                    principal,
                    e
                );
                ListProjectMembersResult::Err(e)
            }
        }
    }
}
