# Digital Asset Management System - Complete UI & Architecture Guide

## PART 1: SERVICE ARCHITECTURE RECOMMENDATIONS

### ✅ SERVICES TO KEEP (Required Core Services)

#### 1. **Asset Service** (`apps/asset/`)

- **Purpose**: Core asset CRUD operations, file upload, version management
- **Current Status**: ✅ Implemented
- **Key Functions**:
  - Upload assets to MinIO
  - Create asset records in database
  - Version management
  - Asset metadata storage
- **Endpoints**:
  - `POST /upload` - Upload new asset
  - `GET /:id` - Get asset details
  - `PUT /:id/version` - Create new version
  - `GET /:id/versions` - Get version history

#### 2. **Metadata Service** (`apps/metadata/`)

- **Purpose**: Manage tags, classifications, and enriched metadata
- **Current Status**: ✅ Implemented
- **Key Functions**:
  - Store extracted metadata
  - AI/ML classification results
  - Tag management
  - Duplicate detection metadata
- **Endpoints**:
  - `GET /asset/:id` - Get metadata
  - `PUT /asset/:id` - Update metadata
  - `POST /analyze` - Trigger analysis

#### 3. **Worker Service** (`apps/worker/`)

- **Purpose**: Async media processing, heavy computation
- **Current Status**: ✅ Implemented with services
- **Key Functions**:
  - Image analysis (sharp)
  - Video processing (ffmpeg)
  - Thumbnail generation
  - Hash calculation for duplicates
- **Processors**:
  - `processImage()` - Analyze images
  - `processVideo()` - Analyze videos
  - `analysisService` - Central processor

#### 4. **Shared Package** (`packages/shared/`)

- **Purpose**: Shared configurations, database, models, utilities
- **Current Status**: ✅ Implemented
- **Key Components**:
  - Database configuration
  - Data models (Asset, Metadata, Version, Usage)
  - Messaging/events
  - Error handling
  - Logging

### ⚠️ SERVICES TO OPTIMIZE

#### Analytics Service (`apps/analytics/`)

- **Current Status**: Empty (no services implemented)
- **Recommendation**: **MERGE with Dashboard**
  - Move analytics queries to React components
  - Query database directly from dashboard-ui
  - Use server-side report generation (optional)
  - Consider: Create aggregation service if reports are heavy

#### Usage Service (`apps/usage/`)

- **Current Status**: Empty (no services implemented)
- **Recommendation**: **KEEP but Implement Properly**
  - Track asset views/downloads
  - Record who accessed what and when
  - Create audit trails
  - Generate engagement metrics
  - **Alternative**: Move to Worker Service for async tracking

### 🗑️ SERVICES TO ARCHIVE

**None currently** - All services have clear purposes. Focus on implementation instead.

---

## PART 2: COMPLETE UI FLOW ARCHITECTURE

### Dashboard Structure

```
Digital Asset Management System (DAM)
├── 🏠 Dashboard Home
│   ├── Key Metrics (4-stat grid)
│   ├── Processing Jobs Status
│   ├── Usage Trends Chart
│   ├── Recent Activities
│   └── Quick Action Links
├── 📁 Assets Management
│   ├── Asset List/Grid View
│   ├── Advanced Filters & Search
│   ├── Bulk Actions
│   └── Asset Detail View
├── 📊 Intelligence Reports
│   ├── Usage Analytics
│   ├── Compliance Dashboard
│   ├── Duplication Analysis
│   └── Exportable Reports
├── ✅ Compliance Management
│   ├── Flagged Assets
│   ├── Expiring Items
│   ├── Missing Approvals
│   ├── Risk Assessment
│   └── Bulk Actions
├── ⚙️ Admin - Background Jobs
│   ├── Job Queue Monitoring
│   ├── Job History
│   ├── Error Logs
│   └── Job Controls
├── ⚙️ Settings
│   ├── User Profile
│   ├── Appearance (Theme)
│   ├── Notifications
│   ├── Security (2FA, password)
│   ├── Admin Settings
│   └── Integrations
└── Components
    ├── Layout (Header, Sidebar, Footer)
    ├── Upload Modal
    ├── Asset Card
    ├── Filter Panel
    └── Status Badges
```

---

## PART 3: PAGE-BY-PAGE IMPLEMENTATION GUIDE

### 1. **Dashboard Page** ✅ COMPLETED

**File**: `apps/dashboard-ui/src/pages/Dashboard/DashboardPage.tsx`

**Features Implemented**:

- ✅ 4-stat cards with trends
- ✅ Background processing status
- ✅ Usage trends visualization
- ✅ Recent activities feed
- ✅ Quick action links
- ✅ Real-time data loading

**UI Components**:

```
┌─────────────────────────────────────────────────┐
│ Dashboard Home | +Upload                         │
├─────────────────────────────────────────────────┤
│ [12,480]  [42]  [15]  [98.2%]                  │
│ Total    Pending Expiring Compliant            │
├─────────────────────────────────────────────────┤
│ Background Processing │ Usage Trends           │
│ Job1: 75% ████████□   │ [Line Chart Area]      │
│ Job2: 45% ██████□      │                        │
├─────────────────────────────────────────────────┤
│ Recent Activities                               │
│ • Product.jpg - Uploaded - 2 hours ago         │
│ • Video.mp4 - Under Review - 4 hours ago       │
├─────────────────────────────────────────────────┤
│ [Browse] [Reports] [Compliance] [Jobs]         │
└─────────────────────────────────────────────────┘
```

**API Integration Needed**:

```typescript
GET /api/dashboard/stats
{
  totalAssets: 12480,
  pendingReview: 42,
  expiringSoon: 15,
  complianceRate: 98.2
}

GET /api/dashboard/jobs
{ jobs: [...] }

GET /api/dashboard/activities
{ activities: [...] }
```

---

### 2. **Asset List Page** ✅ ENHANCEMENTS NEEDED

**File**: `apps/dashboard-ui/src/pages/Assets/AssetListPage.tsx`

**Features to Implement**:

```
┌────────────────────────────────────────┐
│ Assets Library (1,240 items)  [Upload] │
├────────────────────────────────────────┤
│ [Search...] [Filters] [Grid/List]     │
├────────────────────────────────────────┤
│ GRID VIEW:                             │
│ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │ IMG  │ │ VID  │ │ PDF  │           │
│ │Hero  │ │Walk- │ │Brand │           │
│ │jpg   │ │through│ │Guide │           │
│ │✓App  │ │⏳Pend│ │✓App  │           │
│ └──────┘ └──────┘ └──────┘           │
│ [👁 📝 ↓ 🔗]  [👁 📝 ↓ 🔗]            │
├────────────────────────────────────────┤
│ LIST VIEW:                             │
│ Name        Type  Size  Date  Status   │
│ Hero.jpg   Image 2.4MB 2d ago ✓App    │
│ Walk.mp4   Video 156MB 5h ago ⏳Pend  │
```

**Filter Options**:

- By Status (Approved, Pending, Under Review, Archived)
- By Type (Image, Video, Document, Audio)
- By Department
- By Owner
- Date Range
- By Size

**Bulk Actions**:

- Bulk Approve / Reject
- Bulk Download
- Bulk Archive
- Bulk Move to Collection
- Bulk Delete

**Available Actions per Asset**:

```
├─ View / Preview
├─ Edit Metadata
├─ Download
├─ Share / Collaborate
├─ Publish New Version
├─ View Activity Log
├─ Move to Collection
└─ Archive / Delete
```

---

### 3. **Asset Detail Page** ✅ ENHANCEMENTS NEEDED

**File**: `apps/dashboard-ui/src/pages/Assets/AssetDetailPage.tsx`

**Full Layout**:

```
┌──────────────────────────────────────────────┐
│ [Back] Title.mp4  [Share] [Download] [Edit] │
├────────────────────────────────┬─────────────┤
│ PREVIEW (Left)                 │ METADATA    │
│ ┌──────────────────────────┐  │ ┌─────────┐ │
│ │  [Video Thumbnail]       │  │ Owner: PR│ │
│ │  1920x1080, 2:45, 156MB │  │ Status: P│ │
│ │  [Play Video]            │  │ Rights:U │ │
│ └──────────────────────────┘  │ Expiry:12│ │
│                                │ Dept: PR │ │
├────────────────────────────────┴─────────────┤
│ [Versions] [Activity] [Usage] [Compliance]  │
├────────────────────────────────────────────────┤
│ VERSION HISTORY:                              │
│ v3: Today 10:21 AM - "Final color grading"  │
│ v2: Yesterday 4:30 PM - "Added transitions" │
│ v1: 2 days ago - "Initial upload"            │
│     [Restore] [Download] [Compare]           │
├────────────────────────────────────────────────┤
│ ACTIVITY LOG:                                 │
│ • Uploaded by Sarah Chen - 2 days ago        │
│ • Version updated by Alex - Yesterday        │
│ • Task: Metadata Extraction - Complete       │
├────────────────────────────────────────────────┤
│ USAGE DATA:                                   │
│ Downloads: 24 times                          │
│ Last Used: 2 hours ago by Sarah Chen        │
│ Used in: Press Deck, Social Media Campaign  │
└────────────────────────────────────────────────┘
```

**Tabs**:

1. **Overview** (Metadata + Preview)
2. **Versions** (History, Restore, Compare)
3. **Activity** (Audit Trail)
4. **Usage** (Views, Downloads, Where Used)
5. **Compliance** (Rights, Expiry, Approvals)

---

### 4. **Intelligence Reports Page** ✅ ENHANCEMENTS NEEDED

**File**: `apps/dashboard-ui/src/pages/Reports/ReportsPage.tsx`

**Report Types**:

```
1. USAGE ANALYTICS
   ├─ Downloads over time (line chart)
   ├─ Most accessed assets (top 10 table)
   ├─ By department / user / type
   └─ Engagement trends

2. ASSET HEALTH
   ├─ Expiring assets (next 30/60/90 days)
   ├─ Missing metadata
   ├─ Unapproved assets
   └─ Risk scores

3. DUPLICATION ANALYSIS
   ├─ Duplicate clusters
   ├─ Storage reclaimable
   ├─ Similarity groups
   └─ Merge/delete recommendations

4. COMPLIANCE DASHBOARD
   ├─ Compliance score (%)
   ├─ Flagged assets
   ├─ Missing rights
   ├─ Expiry violations
   └─ Department compliance view

5. ASSET LIBRARY INSIGHTS
   ├─ Total assets by type
   ├─ Growth trends
   ├─ Status distribution
   ├─ Department breakdown
   └─ Storage usage
```

**Filter Controls**:

- Time Range (7, 30, 90 days | Custom)
- Department Filter
- Asset Type Filter
- Status Filter
- Owner Filter

**Export Options**:

- PDF Report
- CSV Data
- PNG Charts
- Share Report URL

---

### 5. **Compliance Dashboard** ✅ COMPLETED

**File**: `apps/dashboard-ui/src/pages/Compliance/CompliancePage.tsx`

**Features Implemented**:

- ✅ Compliance issues table
- ✅ Issue types (expired, missing rights, duplicates, risk)
- ✅ Severity indicators
- ✅ Bulk actions
- ✅ Quick stats
- ✅ Tab filtering

**Issue Types Tracked**:

```
1. EXPIRED ASSETS
   Description: Asset expiry date has passed
   Action: Archive or renew

2. MISSING USAGE RIGHTS
   Description: No usage rights recorded
   Action: Add rights information

3. DUPLICATES DETECTED
   Description: Similar assets found
   Action: Merge or delete

4. RISK FLAGS
   Description: Manual flags by admin
   Action: Review and approve
```

---

### 6. **Admin - Background Jobs Page** ✅ ENHANCEMENTS NEEDED

**File**: `apps/dashboard-ui/src/pages/Admin/AdminJobsPage.tsx`

**Job Types** that appear on this page:

```
1. MEDIA ANALYSIS
   - Image analysis (colors, objects, text detection)
   - Video frame extraction
   - Duration calculation

2. METADATA EXTRACTION
   - Automatic tagging
   - Classification
   - Rights detection

3. DUPLICATE DETECTION
   - Similarity analysis
   - Hash duplicates
   - Perceptual hashing

4. COMPLIANCE SCANNING
   - Expiry checks
   - Rights validation
   - Risk assessment

5. REPORT GENERATION
   - Aggregate statistics
   - Trend analysis
   - Export compilation
```

**Job Details View**:

```
Job ID: JOB-102
Type: Metadata Extraction
Asset: vid_launch_01.mp4
Status: Running 65%

Progress:
├─ Extract duration ✓
├─ Scan for text ✓
├─ Color analysis ⏳ (in progress)
├─ Object detection ⏹
└─ Classification ⏹

Logs:
2025-04-08 10:21:15 - Started extraction
2025-04-08 10:21:22 - Duration: 2m 45s
2025-04-08 10:21:45 - Color analysis started
```

**Controls**:

- Pause Job
- Cancel Job
- Retry Failed Job
- View Logs
- Export Results

---

### 7. **Settings Page** ✅ COMPLETED

**File**: `apps/dashboard-ui/src/pages/Settings/SettingsPage.tsx`

**Sections Implemented**:

- ✅ Profile Management
- ✅ Appearance (Theme selector)
- ✅ Notifications (4 options)
- ✅ Security (Password, 2FA, Sessions)
- ✅ Admin Settings (Users, Collections, Integrations, Storage)
- ✅ Danger Zone (Logout, Delete Account)

---

## PART 4: DATABASE MODELS REFERENCE

### Asset Model

```typescript
interface Asset {
  id: string;
  filename: string;
  storage_key: string;
  owner: string;
  size: number;
  mimetype: string;
  status: "pending" | "reviewed" | "approved" | "expired" | "archived";
  department?: string;
  usage_rights?: string;
  expiry_date?: Date;
  collection_id?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Metadata Model

```typescript
interface Metadata {
  id: string;
  asset_id: string;
  tags: string[];
  department: string;
  analysis_results: {
    colors?: string[];
    objects?: string[];
    hasText?: boolean;
    thumbnailUrl?: string;
  };
  is_duplicate: boolean;
  duplicate_of?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Usage Model (To Implement)

```typescript
interface UsageRecord {
  id: string;
  asset_id: string;
  accessed_by: string;
  action: "view" | "download" | "export" | "share";
  accessed_at: Date;
  context?: string; // Where it was used
}
```

---

## PART 5: API ENDPOINTS NEEDED

### Dashboard APIs

```
GET  /api/dashboard/stats
GET  /api/dashboard/jobs?status=running
GET  /api/dashboard/activities?limit=10
```

### Asset APIs

```
GET    /api/assets?skip=0&limit=20&filter=...
POST   /api/assets/upload (multipart)
GET    /api/assets/:id
PUT    /api/assets/:id/metadata
POST   /api/assets/:id/version
GET    /api/assets/:id/versions
GET    /api/assets/:id/usage
```

### Metadata APIs

```
GET    /api/metadata/:assetId
PUT    /api/metadata/:assetId
POST   /api/metadata/analyze/:assetId
GET    /api/metadata/duplicates
```

### Compliance APIs

```
GET    /api/compliance/issues?type=expired
GET    /api/compliance/score
POST   /api/compliance/bulk-action
```

### Jobs APIs

```
GET    /api/jobs?status=running
GET    /api/jobs/:id/logs
POST   /api/jobs/:id/pause
POST   /api/jobs/:id/cancel
POST   /api/jobs/:id/retry
```

### Reports APIs

```
GET    /api/reports/usage?timeRange=30&department=...
GET    /api/reports/compliance
GET    /api/reports/duplicates
GET    /api/reports/export?format=pdf
```

---

## PART 6: FEATURES ROADMAP

### Phase 1: CORE (Current)

- ✅ Asset upload & storage
- ✅ Metadata management
- ✅ Worker processing
- ✅ Dashboard
- ✅ Asset browser
- ⚠️ Compliance (basic)

### Phase 2: ENHANCEMENT

- [ ] Advanced search/filters
- [ ] Collections/Folders
- [ ] Sharing & Collaboration
- [ ] Advanced reporting
- [ ] Bulk operations

### Phase 3: ADVANCED

- [ ] AI-powered recommendations
- [ ] Smart tagging
- [ ] Usage analytics
- [ ] Approval workflows
- [ ] Integration APIs

---

## PART 7: DEPLOYMENT STRUCTURE

```
digital-asset-management/
├── apps/
│   ├── asset/        ← Core asset service
│   ├── metadata/     ← Metadata service
│   ├── worker/       ← Async processing
│   ├── dashboard-ui/ ← Frontend React app
│   └── [ARCHIVE]
│       ├── analytics/ (merge to dashboard)
│       └── usage/ (implement if needed)
├── packages/
│   └── shared/       ← Shared configs & models
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── nginx/        ← API gateway
│   └── postgres-init/
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── SETUP.md
```

---

## NEXT STEPS

1. **Backend**: Implement missing API endpoints
2. **Database**: Set up models and migrations
3. **Frontend**: Connect React components to APIs
4. **Testing**: Unit & integration tests
5. **Deployment**: Docker & CI/CD pipeline
