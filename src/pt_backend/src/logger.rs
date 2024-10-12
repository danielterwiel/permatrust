use ic_cdk::println;
use shared::pt_backend_generated::{Document, Organisation, Project, Revision, User, Workflow};
use std::cell::RefCell;
use std::env;
use std::fmt::Debug;

pub struct LoggableUser<'a>(&'a User);
pub struct LoggableWorkflow<'a>(&'a Workflow);
pub struct LoggableOrganisation<'a>(&'a Organisation);
pub struct LoggableProject<'a>(&'a Project);
pub struct LoggableDocument<'a>(&'a Document);
pub struct LoggableRevision<'a>(&'a Revision);

impl<'a> std::fmt::Display for LoggableUser<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "User {{ id: {}, first_name: {}, last_name: {} }}",
            self.0.id, self.0.first_name, self.0.last_name
        )
    }
}

impl<'a> std::fmt::Display for LoggableWorkflow<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Workflow {{ id: {}, name: {} }}", self.0.id, self.0.name,)
    }
}

impl<'a> std::fmt::Display for LoggableOrganisation<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Organisation {{ id: {}, name: {}, created_by: {} }}",
            self.0.id, self.0.name, self.0.created_by
        )
    }
}

impl<'a> std::fmt::Display for LoggableProject<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Project {{ id: {}, name: {}, created_by: {} }}",
            self.0.id, self.0.name, self.0.created_by
        )
    }
}

impl<'a> std::fmt::Display for LoggableDocument<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Document {{ id: {}, title: {} }}",
            self.0.id, self.0.title
        )
    }
}

impl<'a> std::fmt::Display for LoggableRevision<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Revision {{ id: {}, document_id: {} }}",
            self.0.id, self.0.document_id
        )
    }
}

pub fn loggable_user(user: &User) -> LoggableUser {
    LoggableUser(user)
}

pub fn loggable_workflow(workflow: &Workflow) -> LoggableWorkflow {
    LoggableWorkflow(workflow)
}

pub fn loggable_organisation(organistation: &Organisation) -> LoggableOrganisation {
    LoggableOrganisation(organistation)
}

pub fn loggable_project(project: &Project) -> LoggableProject {
    LoggableProject(project)
}

pub fn loggable_document(document: &Document) -> LoggableDocument {
    LoggableDocument(document)
}

pub fn loggable_revision(revision: &Revision) -> LoggableRevision {
    LoggableRevision(revision)
}

#[derive(Clone, Debug, candid::CandidType, PartialEq, Ord, PartialOrd, Eq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

thread_local! {
    static LOG_LEVEL: RefCell<LogLevel> = RefCell::new(LogLevel::Info);
}

fn log<T: Debug>(level: LogLevel, message: &str, value: T) {
    LOG_LEVEL.with(|current_level| {
        if level <= *current_level.borrow() {
            println!(
                "[{}] {} : {:?}",
                format!("{:?}", level).to_uppercase(),
                message,
                value
            );
        }
    });
}

pub fn log_error<T: Debug>(message: &str, value: T) {
    log(LogLevel::Error, message, value);
}

pub fn log_warn<T: Debug>(message: &str, value: T) {
    log(LogLevel::Warn, message, value);
}

pub fn log_info<T: std::fmt::Display>(message: &str, value: T) {
    LOG_LEVEL.with(|current_level| {
        if LogLevel::Info <= *current_level.borrow() {
            println!(
                "[{}] {} {}",
                format!("{:?}", LogLevel::Info).to_uppercase(),
                message,
                value
            );
        }
    });
}

pub fn log_debug<T: Debug>(message: &str, value: T) {
    log(LogLevel::Debug, message, value);
}

pub fn init_logger() {
    let log_level = env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());
    let level = match log_level.to_lowercase().as_str() {
        "error" => LogLevel::Error,
        "warn" => LogLevel::Warn,
        "info" => LogLevel::Info,
        "debug" => LogLevel::Debug,
        _ => LogLevel::Info,
    };
    LOG_LEVEL.with(|l| *l.borrow_mut() = level);
}
