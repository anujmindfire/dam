# Detailed Implementation Checklist

## PHASE 1: CRITICAL (High Impact, ~15 hours)

### 1. Approval & Review Workflow ⏳ (6 hours)
- [ ] Create Approval model
  - [ ] id, assetId, requestedBy, approvedBy, status, reason, createdAt, updatedAt
  - [ ] Add relationships to Asset and User
- [ ] Create ApprovalRequest model
  - [ ] Track pending approvals with priority, comments
- [ ] Implement Approval Service
  - [ ] createApprovalRequest(assetId, reason)
  - [ ] getApprovalById(id)
  - [ ] listPendingApprovals(page, filter)
  - [ ] approveAsset(approvalId, feedback)
  - [ ] rejectAsset(approvalId, reason)
  - [ ] getSuggestedApprovers(assetId)
- [ ] Create Approval Controller & Routes
  - [ ] POST /approvals - Create request
  - [ ] GET /approvals - List pending
  - [ ] GET /approvals/:id - Get details
  - [ ] PATCH /approvals/:id/approve - Approve
  - [ ] PATCH /approvals/:id/reject - Reject
  - [ ] GET /approvals/asset/:assetId/history - Approval history
- [ ] Implement approval notification system
  - [ ] Send email to approvers
  - [ ] Log approval events
- [ ] Add permissions middleware
  - [ ] Only approvers can approve
  - [ ] Only asset owner/admin can request

### 2. Complete Queue Consumers ⏳ (3 hours)
**Metadata Service** (apps/metadata)
- [ ] Import consumeMessage from shared
- [ ] Create consumer for asset_uploaded queue
  - [ ] Extract tags from analysisResults
  - [ ] Store enriched metadata
  - [ ] Log errors
- [ ] Create consumer for asset_updated queue
  - [ ] Update metadata associations
- [ ] Implement error handling with exponential backoff

**Usage Service** (apps/usage)
- [ ] Create consumer for asset_created queue
  - [ ] Initialize usage tracking record
  - [ ] Set baseline metrics
- [ ] Create consumer for asset_deleted queue
  - [ ] Archive usage data
  - [ ] Clean up logs
- [ ] Add health check endpoint

**Asset Service** (apps/asset)
- [ ] Clarify purpose vs main server
- [ ] Implement specialized endpoints OR mark as deprecated

### 3. Event Publishing Completeness ⏳ (2 hours)
**In Asset Service** (apps/server/src/services/asset.ts)
- [ ] Add publishMessage('asset_updated') on PATCH
- [ ] Add publishMessage('asset_deleted') on DELETE
- [ ] Include full asset details in published events
- [ ] Add event versioning field

**Event Schema Documentation**
- [ ] asset_created: {assetId, filename, owner, timestamp}
- [ ] asset_updated: {assetId, changes, updatedBy, timestamp}
- [ ] asset_deleted: {assetId, deletedBy, timestamp}
- [ ] metadata_analyzed: {assetId, analysisResults, timestamp}

### 4. Queue Error Handling ⏳ (2 hours)
- [ ] Implement retry logic with exponential backoff
- [ ] Create dead-letter queue for permanently failed messages
- [ ] Add monitoring/alerting for queue failures
- [ ] Log all consumer errors with context
- [ ] Add circuit breaker pattern for external service failures

### 5. Import/Type Fixes ⏳ (30 minutes)
- [x] Fix messaging.ts amqplib import
- [ ] Verify all service imports are correct
- [ ] Check for any circular dependencies
- [ ] Validate all types match model definitions

---

## PHASE 2: HIGH PRIORITY (8-12 hours)

### 1. Complete RBAC Implementation ⏳ (4 hours)
**Model Updates**
- [ ] Add permissions table
  - [ ] resource, action, description
- [ ] Add role_permissions junction table
- [ ] Add department hierarchy

**Service Implementation**
- [ ] getRolePermissions(roleId)
- [ ] checkPermission(userId, resource, action)
- [ ] assignRole(userId, roleId)
- [ ] updatePermissions(roleId, permissions[])

**Middleware**
- [ ] requirePermission(resource, action) middleware
- [ ] Update all protected routes

**Controllers**
- [ ] GET /roles - List roles
- [ ] POST /roles - Create role
- [ ] PATCH /roles/:id/permissions - Update permissions
- [ ] GET /users/:id/permissions - Get user permissions

### 2. Report Generation ⏳ (4-5 hours)
**Report Service** (apps/server/src/services/reports.ts)
- [ ] generateAssetReport(filters, format)
- [ ] generateComplianceReport(filters)
- [ ] generateUsageReport(assetId, dateRange)
- [ ] generateDepartmentReport(department, dateRange)
- [ ] scheduleReportGeneration(cron, template)

**Report Templates**
- [ ] Asset inventory tables
- [ ] Compliance metrics charts
- [ ] Usage trends graphs
- [ ] Department breakdowns

**Export Formats**
- [ ] PDF export (pdfkit)
- [ ] Excel export (xlsx)
- [ ] CSV export
- [ ] JSON export

**Report Controller & Routes**
- [ ] POST /reports - Create report
- [ ] GET /reports - List generated reports
- [ ] GET /reports/:id - Download/view
- [ ] POST /reports/schedule - Schedule recurring
- [ ] DELETE /reports/:id - Delete report

**Email Delivery**
- [ ] nodemailer integration
- [ ] Send report via email
- [ ] Scheduled email delivery

### 3. Advanced Search & Filtering ⏳ (4 hours)
**Full-Text Search**
- [ ] Add GIN index on asset metadata
- [ ] Implement PostgreSQL full-text search
- [ ] Search across filename, tags, metadata

**Enhanced Filtering**
- [ ] Date range filters (createdAt, expiryDate)
- [ ] Multiple status filters
- [ ] Metadata attribute filters
- [ ] Size range filters
- [ ] Saved search filters

**Faceted Search**
- [ ] Get available facets
- [ ] Count assets per facet
- [ ] Multiple facet selection

**Search Service**
- [ ] advancedSearch(query, filters, facets)
- [ ] saveSearch(userId, name, filters)
- [ ] getSearchHistory(userId)
- [ ] getSuggestedSearches(query)

**Routes**
- [ ] POST /search/advanced - Execute search
- [ ] GET /search/facets - Available facets
- [ ] POST /search/saved - Save search
- [ ] GET /search/history - Search history

### 4. Compliance Rule Engine ⏳ (3-4 hours)
**Models**
- [ ] ComplianceRule model
  - [ ] name, description, condition, action, enabled
- [ ] AssetViolation model
  - [ ] assetId, ruleId, violationType, severity
- [ ] ViolationAction model
  - [ ] violationId, action, executedAt, result

**Compliance Service**
- [ ] defineRule(name, condition, action)
- [ ] evaluateAsset(assetId) against all rules
- [ ] flagViolations(assetId, violations[])
- [ ] remediateViolations(violationId, action)
- [ ] generateComplianceReport()

**Rule Examples**
- [ ] Expiry rule: flag if expiryDate < today
- [ ] Duplicate rule: flag if isDuplicate = true
- [ ] License rule: check usageRights valid
- [ ] Retention rule: flag if > X days old without use
- [ ] Access rule: flag if sensitive without approval

**Routes**
- [ ] POST /compliance/rules - Create rule
- [ ] GET /compliance/rules - List rules
- [ ] POST /compliance/rules/:id/scan - Scan assets
- [ ] GET /compliance/violations - List violations
- [ ] PATCH /compliance/violations/:id/remediate - Fix violation

---

## PHASE 3: MEDIUM PRIORITY (10-12 hours)

### 1. Audit Trail / Change Tracking ⏳ (3 hours)
**Model**
- [ ] AuditLog model
  - [ ] assetId, userId, action, changes, timestamp
  - [ ] oldValue, newValue for each field changed

**Service**
- [ ] logAuditEvent(userId, assetId, action, changes)
- [ ] getAuditTrail(assetId)
- [ ] searchAuditLogs(filters)

**Integration Points**
- [ ] Log on createAsset, updateAsset, deleteAsset
- [ ] Log on status changes
- [ ] Log on approval actions
- [ ] Log on metadata updates

**Routes**
- [ ] GET /assets/:id/audit - Get asset changes
- [ ] GET /audit - Search all audit logs
- [ ] GET /audit/report - Audit report

### 2. Tag Management System ⏳ (3 hours)
**Models**
- [ ] Tag model (id, name, count, category)
- [ ] AssetTag junction table

**Service**
- [ ] createTag(name, category)
- [ ] addTagToAsset(assetId, tagId)
- [ ] removeTagFromAsset(assetId, tagId)
- [ ] getTagCloud() - Tags with frequency
- [ ] suggestTags(searchQuery)
- [ ] mergeTagsdup(oldTagId, newTagId)

**Routes**
- [ ] POST /tags - Create tag
- [ ] GET /tags - List tags with frequency
- [ ] GET /tags/suggestions - Tag suggestions
- [ ] POST /assets/:id/tags - Add tags to asset
- [ ] DELETE /assets/:id/tags/:tagId - Remove tag

### 3. Email Notifications ⏳ (4-5 hours)
**Service** (nodemailer/SendGrid)
- [ ] sendApprovalRequest(approver, asset)
- [ ] sendApprovalApproved(requester, asset)
- [ ] sendApprovalRejected(requester, asset, reason)
- [ ] sendExpiryWarning(owner, assetId, days)
- [ ] sendDuplicateDetected(owner, assetId, duplicateId)
- [ ] sendReportGenerated(user, reportId)
- [ ] sendComplianceAlert(admin, violations[])

**Email Templates**
- [ ] Approval request template
- [ ] Approval decision template
- [ ] Expiry warning template
- [ ] Duplicate alert template
- [ ] Report ready template

**Routes**
- [ ] POST /notifications/preferences - Set preferences
- [ ] GET /notifications/preferences - Get preferences
- [ ] POST /notifications/test-email - Send test

### 4. Test Coverage ⏳ (3-4 hours)
**Unit Tests**
- [ ] Service tests for all CRUD operations
- [ ] Validation tests
- [ ] Helper function tests

**Integration Tests**
- [ ] Upload → Worker → Metadata flow
- [ ] Asset creation → Queue publish → Consumer
- [ ] Approval workflow end-to-end
- [ ] Search with filters

**API Tests**
- [ ] Authentication flow
- [ ] Authorization checks
- [ ] Input validation
- [ ] Error handling

---

## PHASE 4: ENHANCEMENTS (Optional, 8-12 hours)

### 1. API Optimization ⏳ (3 hours)
- [ ] Add database indexes
  - [ ] On status, owner, createdAt, expiryDate
  - [ ] On asset.id, metadata.assetId
  - [ ] Full-text search indexes
- [ ] Query optimization
  - [ ] Use lean() for read-only queries
  - [ ] Implement cursor pagination
  - [ ] Add GraphQL layer (optional)

### 2. Metadata Templates ⏳ (3 hours)
- [ ] MetadataTemplate model
- [ ] Define custom fields per asset type
- [ ] Validate assets against template
- [ ] Template CRUD endpoints

### 3. Advanced Analytics ⏳ (3 hours)
- [ ] Usage trend analysis
- [ ] Asset popularity metrics
- [ ] Department consumption analysis
- [ ] Storage cost analysis
- [ ] Predictive analytics (which assets will expire?)

### 4. CI/CD Pipeline ⏳ (3 hours)
- [ ] GitHub Actions workflow
  - [ ] Run tests on PR
  - [ ] Build Docker images
  - [ ] Push to registry
  - [ ] Deploy to staging/prod

---

## PRIORITY MATRIX

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Approval Workflow | ⭐⭐⭐⭐⭐ | 6h | P0 |
| Queue Consumers | ⭐⭐⭐⭐⭐ | 3h | P0 |
| Event Publishing | ⭐⭐⭐⭐ | 2h | P0 |
| Error Handling | ⭐⭐⭐⭐ | 2h | P0 |
| RBAC Complete | ⭐⭐⭐⭐ | 4h | P1 |
| Reports | ⭐⭐⭐⭐ | 5h | P1 |
| Advanced Search | ⭐⭐⭐ | 4h | P2 |
| Compliance Engine | ⭐⭐⭐ | 4h | P2 |
| Audit Trail | ⭐⭐⭐ | 3h | P2 |
| Tags | ⭐⭐⭐ | 3h | P2 |
| Email Notifications | ⭐⭐⭐ | 5h | P2 |
| Tests | ⭐⭐⭐ | 4h | P2 |

---

## COMPLETION ESTIMATE

- **Phase 1 (Critical)**: 13-15 hours → Core functionality complete
- **Phase 2 (High Priority)**: 12-15 hours → Advanced features
- **Phase 3 (Medium)**: 13-17 hours → Polish & completeness
- **Phase 4 (Enhancement)**: 8-12 hours → Optimization & extras

**Total: 46-59 development hours → Production-ready system**

**Timeline**:
- Solo developer: 3-4 weeks (part-time)
- Team of 2: 2-3 weeks
- Team of 3: 1-2 weeks

---

## TESTING STRATEGY

### Unit Tests (30% effort)
- Test each service function independently
- Mock database calls
- Verify error handling

### Integration Tests (40% effort)
- Test complete workflows
- Test queue message flows
- Test cross-service communication

### E2E Tests (30% effort)
- Test complete user journeys
- Test API contracts
- Test error scenarios

### Coverage Goals
- Minimum 80% code coverage
- 100% coverage for critical paths (auth, approvals, RBAC)
- All error cases covered
