use super::*;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static WORKFLOWS: RefCell<StableBTreeMap<WorkflowId, Workflow, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    static NEXT_ID: AtomicU32 = const { AtomicU32::new(0) };
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct GenericState(pub StateId);

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct GenericEvent(pub EventId);

#[derive(Clone, Debug)]
pub struct GenericStateMachine {
    transitions: HashMap<(StateId, EventId), StateId>,
    current_state: StateId,
}

pub fn get_next_id() -> WorkflowId {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn insert(id: WorkflowId, workflow: Workflow) {
    WORKFLOWS.with(|workflows| {
        workflows.borrow_mut().insert(id, workflow);
    });
}

pub fn get_all() -> Vec<Workflow> {
    WORKFLOWS.with(|workflows| {
        workflows
            .borrow()
            .iter()
            .map(|(_, workflow)| workflow.clone())
            .collect()
    })
}

pub fn get_by_id(id: &WorkflowId) -> Option<Workflow> {
    WORKFLOWS.with(|workflows| workflows.borrow().get(id))
}

pub fn update(id: WorkflowId, workflow: Workflow) {
    WORKFLOWS.with(|workflows| {
        workflows.borrow_mut().insert(id, workflow);
    });
}

impl GenericStateMachine {
    pub fn new(initial_state: StateId) -> Self {
        GenericStateMachine {
            transitions: HashMap::new(),
            current_state: initial_state,
        }
    }

    pub fn add_transition(&mut self, from: StateId, event: EventId, to: StateId) {
        self.transitions.insert((from, event), to);
    }

    pub fn transition(&mut self, event: &EventId) -> Result<(), String> {
        if let Some(new_state) = self
            .transitions
            .get(&(self.current_state.clone(), event.clone()))
        {
            self.current_state = new_state.clone();
            Ok(())
        } else {
            Err(format!(
                "Invalid transition: {} from state {}",
                event, self.current_state
            ))
        }
    }

    pub fn current_state(&self) -> &StateId {
        &self.current_state
    }

    pub fn from_workflow_graph(graph: &WorkflowGraph, initial_state: StateId) -> Self {
        let mut state_machine = GenericStateMachine::new(initial_state);

        for Edge(source_idx, target_idx, event) in &graph.edges {
            let from = &graph.nodes[*source_idx as usize];
            let to = &graph.nodes[*target_idx as usize];
            state_machine.add_transition(from.clone(), event.clone(), to.clone());
        }

        state_machine
    }
}
