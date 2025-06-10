use std::cell::RefCell;
use std::env;

use crate::traits::logs::LogStorage;
use crate::types::logs::{CanisterOrigin, LogEntry, LogLevel};

// Import entity types for loggable wrappers
use crate::types::documents::Document;
use crate::types::invites::Invite;
use crate::types::organization::Organization;
use crate::types::projects::Project;
use crate::types::revisions::Revision;
use crate::types::users::User;
use crate::types::workflows::Workflow;

// Global log storage instance - set by each canister
thread_local! {
    static LOG_LEVEL: RefCell<LogLevel> = const { RefCell::new(LogLevel::Info) };
    static CANISTER_ORIGIN: RefCell<Option<CanisterOrigin>> = const { RefCell::new(None) };
    static LOG_STORAGE: RefCell<Option<Box<dyn LogStorage>>> = RefCell::new(None);
    static LOG_COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

// Core logging functions
fn should_log(level: LogLevel) -> bool {
    LOG_LEVEL.with(|current_level| level <= *current_level.borrow())
}

fn log_message(level: LogLevel, message: &str) {
    if should_log(level) {
        CANISTER_ORIGIN.with(|origin| {
            let origin_ref = origin.borrow();
            let origin_value = origin_ref.as_ref().cloned().unwrap_or(CanisterOrigin::Main);
            let origin_str = format!("[{}]", origin_value);

            // Print to console (existing behavior)
            ic_cdk::println!("[{}]{} {}", level, origin_str, message);

            // Store in memory for querying
            let log_id = LOG_COUNTER.with(|counter| {
                let mut c = counter.borrow_mut();
                *c += 1;
                *c
            });

            let log_entry = LogEntry {
                id: log_id,
                timestamp: ic_cdk::api::time(),
                level,
                origin: origin_value,
                message: message.to_string(),
            };

            // Store the log entry if storage is available
            LOG_STORAGE.with(|storage| {
                if let Some(ref storage_impl) = *storage.borrow() {
                    storage_impl.store_log(log_entry);
                }
            });
        });
    }
}

// Public logging functions
pub fn log_error(message: &str) {
    log_message(LogLevel::Error, message);
}

pub fn log_warn(message: &str) {
    log_message(LogLevel::Warn, message);
}

pub fn log_info(message: &str) {
    log_message(LogLevel::Info, message);
}

pub fn log_debug(message: &str) {
    log_message(LogLevel::Debug, message);
}

// Logger initialization and configuration
pub fn init_logger(origin: CanisterOrigin) {
    // Set the canister origin
    CANISTER_ORIGIN.with(|o| *o.borrow_mut() = Some(origin.clone()));

    // Determine environment and set appropriate default
    let default_level = if is_production_environment() {
        "debug" // Verbose on integration and production
    } else {
        "info" // Less verbose on local development
    };

    let log_level_str = env::var("LOG_LEVEL").unwrap_or_else(|_| default_level.to_string());
    let level = parse_log_level(&log_level_str);

    LOG_LEVEL.with(|l| *l.borrow_mut() = level);

    log_info(&format!(
        "Logger initialized for {} canister with level: {}",
        origin, level
    ));
}

pub fn set_log_storage<T: LogStorage + 'static>(storage: T) {
    LOG_STORAGE.with(|s| {
        *s.borrow_mut() = Some(Box::new(storage));
    });
}

// Helper functions
fn parse_log_level(level_str: &str) -> LogLevel {
    match level_str.to_lowercase().as_str() {
        "error" => LogLevel::Error,
        "warn" | "warning" => LogLevel::Warn,
        "info" => LogLevel::Info,
        "debug" | "verbose" => LogLevel::Debug,
        _ => LogLevel::Info,
    }
}

fn is_production_environment() -> bool {
    // Check common environment indicators
    // In IC context, we can check for specific environment variables or other indicators
    env::var("DFX_NETWORK")
        .map(|network| network != "local")
        .unwrap_or(false)
        || env::var("IC_ENV")
            .map(|env| env == "production" || env == "staging")
            .unwrap_or(false)
}

// Loggable entity wrappers for consistent entity formatting
pub struct LoggableUser<'a>(pub &'a User);
pub struct LoggableDocument<'a>(pub &'a Document);
pub struct LoggableProject<'a>(pub &'a Project);
pub struct LoggableOrganization<'a>(pub &'a Organization);
pub struct LoggableInvite<'a>(pub &'a Invite);
pub struct LoggableRevision<'a>(pub &'a Revision);
pub struct LoggableWorkflow<'a>(pub &'a Workflow);

impl std::fmt::Display for LoggableUser<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "User[id={}, name=\"{} {}\"]",
            self.0.id, self.0.first_name, self.0.last_name
        )
    }
}

impl std::fmt::Display for LoggableDocument<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Document[id={}, title=\"{}\", project_id={}, created_by={}]",
            self.0.id, self.0.title, self.0.project_id, self.0.created_by
        )
    }
}

impl std::fmt::Display for LoggableProject<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Project[id={}, name=\"{}\", created_by={}, members={}]",
            self.0.id,
            self.0.name,
            self.0.created_by,
            self.0.members.len()
        )
    }
}

impl std::fmt::Display for LoggableOrganization<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Organization[name=\"{}\", created_by={}, members={}, projects={}]",
            self.0.name,
            self.0.created_by,
            self.0.members.len(),
            self.0.projects.len()
        )
    }
}

impl std::fmt::Display for LoggableInvite<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Invite[id={}, random={}, created_by={}, accepted_by={}]",
            self.0.id,
            self.0.random,
            self.0.created_by,
            self.0.accepted_by.unwrap_or(0)
        )
    }
}

impl std::fmt::Display for LoggableRevision<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Revision[id={}, document_id={}, version={}, created_by={}]",
            self.0.id, self.0.document_id, self.0.version, self.0.created_by
        )
    }
}

impl std::fmt::Display for LoggableWorkflow<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Workflow[id={}, name=\"{}\", project_id={}, state=\"{}\"]",
            self.0.id, self.0.name, self.0.project_id, self.0.current_state
        )
    }
}

// Convenience functions for creating loggable wrappers
pub fn loggable_user(user: &User) -> LoggableUser {
    LoggableUser(user)
}

pub fn loggable_document(document: &Document) -> LoggableDocument {
    LoggableDocument(document)
}

pub fn loggable_project(project: &Project) -> LoggableProject {
    LoggableProject(project)
}

pub fn loggable_organization(organization: &Organization) -> LoggableOrganization {
    LoggableOrganization(organization)
}

pub fn loggable_invite(invite: &Invite) -> LoggableInvite {
    LoggableInvite(invite)
}

pub fn loggable_revision(revision: &Revision) -> LoggableRevision {
    LoggableRevision(revision)
}

pub fn loggable_workflow(workflow: &Workflow) -> LoggableWorkflow {
    LoggableWorkflow(workflow)
}

// Convenience macros for easier usage
#[macro_export]
macro_rules! log_error {
    ($($arg:tt)*) => {
        $crate::utils::logs::log_error(&format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_warn {
    ($($arg:tt)*) => {
        $crate::utils::logs::log_warn(&format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_info {
    ($($arg:tt)*) => {
        $crate::utils::logs::log_info(&format!($($arg)*))
    };
}

#[macro_export]
macro_rules! log_debug {
    ($($arg:tt)*) => {
        $crate::utils::logs::log_debug(&format!($($arg)*))
    };
}
