# Permatrust Logging Guidelines

## Overview
Consistent, structured logging for Internet Computer canisters following industry best practices.

## Log Format Structure
```
[LEVEL][ORIGIN] operation_name: description [context] result_indicator
```

## Log Levels

### ERROR - Critical failures requiring immediate attention
- Failed operations that affect system functionality
- Security violations
- Data corruption or loss
- External service failures

**Format**: `operation_name: Failed to action [key=value] - error_details`

**Examples**:
```rust
log_error!("user_creation: Failed to create user [principal={}] - {}", principal, error);
log_error!("wasm_validation: Invalid WASM format [version={}] - expected magic bytes", version);
log_error!("canister_upgrade: Self-upgrade failed [canister={}] - {}", canister_id, error);
```

### WARN - Important events that may require attention
- Deprecated feature usage
- Performance degradation
- Recoverable errors
- Security-related events (failed auth attempts)

**Format**: `operation_name: Warning condition [key=value] - recommendation`

**Examples**:
```rust
log_warn!("auth_check: Authentication failed [principal={}] - retrying", principal);
log_warn!("memory_usage: High memory usage [used={}MB] - consider cleanup", memory_mb);
log_warn!("api_deprecation: Using deprecated endpoint [method={}]", method_name);
```

### INFO - Important business logic events and state changes
- Successful completion of major operations
- State transitions
- Business logic milestones
- User actions

**Format**: `operation_name: Action completed [key=value] result_summary`

**Examples**:
```rust
log_info!("user_creation: Created user [id={}, principal={}]", user.id, principal);
log_info!("project_creation: Created project [id={}, name='{}', members={}]", id, name, member_count);
log_info!("canister_upgrade: Upgrade initiated [version={}, size={}bytes]", version, wasm_size);
log_info!("initialization: Canister initialized [version={}, features={}]", version, features);
```

### DEBUG - Detailed execution information for troubleshooting
- Function entry/exit with parameters
- Intermediate processing steps
- Performance metrics
- Detailed state information

**Format**: `operation_name: Debug information [key=value] details`

**Examples**:
```rust
log_debug!("pagination: Processing request [page={}, limit={}, total={}]", page, limit, total);
log_debug!("chunk_download: Downloaded chunk [id={}/{}, size={}bytes]", chunk_id, total_chunks, size);
log_debug!("validation: Input validation [field={}, value={}]", field_name, field_value);
log_debug!("query_performance: Query executed [duration={}ms, results={}]", duration, count);
```

## Operation Naming Conventions

### Standard Operation Names
- `initialization` - Canister startup
- `upgrade_*` - Canister upgrades (upgrade_start, upgrade_complete)
- `user_*` - User operations (user_creation, user_retrieval, user_update)
- `project_*` - Project operations
- `document_*` - Document operations
- `auth_*` - Authentication/authorization
- `wasm_*` - WASM management
- `api_call` - External API calls
- `storage_*` - Storage operations
- `validation` - Input validation

### Lifecycle Events
- `*_start` - Operation beginning
- `*_complete` - Successful completion
- `*_failed` - Operation failure
- `*_retry` - Retry attempts

## Context Information

### Required Context Keys
- `id` - Entity ID
- `principal` - Caller principal
- `version` - Version numbers
- `size` - Data sizes (bytes, counts)
- `duration` - Time measurements
- `status` - Status codes/states

### Optional Context
- `correlation_id` - For tracing related operations
- `user_id` - When different from principal
- `session_id` - For user sessions
- `request_id` - For request tracing

## Security Considerations

### Never Log
- Passwords or secrets
- Personal data (beyond IDs)
- Internal implementation details in production
- Full stack traces (log error codes instead)

### Sanitize
- User input before logging
- File paths (use relative paths)
- External URLs (mask sensitive parts)

## Performance Guidelines

### Efficient Logging
- Use appropriate log levels
- Avoid expensive operations in debug logs
- Cache frequently logged values
- Use structured data over string concatenation

## Examples by Module

### Authentication
```rust
// Entry point
log_debug!("auth_check: Validating principal [principal={}]", principal);

// Success
log_info!("auth_success: User authenticated [user_id={}, session_duration={}]", user_id, duration);

// Failure
log_warn!("auth_failed: Authentication failed [principal={}, reason={}]", principal, reason);
```

### CRUD Operations
```rust
// Create
log_info!("entity_creation: Created {} [id={}, created_by={}]", entity_type, id, creator);

// Read
log_debug!("entity_retrieval: Retrieved {} [id={}, found={}]", entity_type, id, found);

// Update
log_info!("entity_update: Updated {} [id={}, fields_changed={}]", entity_type, id, field_count);

// Delete
log_info!("entity_deletion: Deleted {} [id={}, cascade_count={}]", entity_type, id, cascade);
```

### Error Handling
```rust
// Validation errors
log_warn!("validation: Invalid input [field={}, value={}, constraint={}]", field, value, rule);

// Business logic errors
log_error!("business_rule: Rule violation [rule={}, entity_id={}, user_id={}]", rule, entity, user);

// System errors
log_error!("system_error: Critical failure [component={}, operation={}] - {}", component, op, error);
```

## Migration Strategy

1. **Phase 1**: Update existing logs to follow new format
2. **Phase 2**: Add missing logs for important operations
3. **Phase 3**: Add debug logging for troubleshooting
4. **Phase 4**: Performance and security audit of all logs

## Tools and Automation

### Log Analysis
- Search by operation name: `grep "user_creation:"`
- Filter by level: `grep "\\[ERROR\\]"`
- Track entity lifecycle: `grep "id=12345"`

### Monitoring Alerts
- ERROR level: Immediate notification
- High frequency WARN: Daily summary
- Performance degradation: Threshold alerts