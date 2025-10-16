# PennForce CRM - Project Summary

## Overview
PennForce CRM is a comprehensive aviation-focused Customer Relationship Management system built with Next.js 15, React 19, TypeScript, and Prisma ORM. It provides enterprise-grade CRM functionality tailored for private aviation businesses.

## Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Frontend**: React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4.1.13
- **Database**: Prisma 6.16.2 with SQLite (dev) / PostgreSQL (prod)
- **Charts**: Recharts for data visualization
- **Drag & Drop**: @hello-pangea/dnd for Kanban boards

## Core Features Implemented

### 1. Data Management
#### Accounts
- Full CRUD operations
- Account type classification (Owner, Operator, MRO, Broker, Charter Customer, Vendor)
- Contact association
- Opportunity tracking
- Aircraft ownership/operation management
- Activity timeline
- Document management

#### Contacts
- Contact information management
- Account association
- Opportunity relationships
- Email integration with "Send Email" button
- Activity logging
- Task tracking

#### Aircraft
- Aircraft registry and management
- Owner and operator account linking
- Status tracking (Active, For Sale, Maintenance, In Acquisition, Retired)
- Total time and cycles tracking
- Work order management
- Trip history
- Document storage
- Activity timeline

#### Opportunities
- Sales pipeline management
- Stage progression (Prospect, Qualify, Proposal, Negotiation, Won, Lost)
- Amount and probability tracking
- Visual stage path indicator
- Account, contact, and aircraft association
- Kanban board view with drag-and-drop
- Activity and task tracking
- Document attachment

#### Tasks
- Task creation and assignment
- Status management (Open, In Progress, Blocked, Done, Canceled)
- Due date tracking
- Entity relationships (Account, Contact, Opportunity)
- Priority management
- Task filtering and search

#### Activities
- Multi-type activity logging (Note, Call, Email, Meeting)
- Timeline visualization
- Relationship linking to all entities
- User attribution
- Chronological history

### 2. Document Management System
- File upload with drag-and-drop interface
- Document metadata (name, description, file type, size)
- Organization-scoped file storage
- Relationship linking (accounts, opportunities, aircraft)
- Download functionality
- Inline editing of document details
- Delete with confirmation
- File type icons (PDF, Word, Excel, Images)
- Integration in detail pages

**API Endpoints**:
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents with filtering
- `GET /api/documents/[id]` - Get document details
- `PATCH /api/documents/[id]` - Update document metadata
- `DELETE /api/documents/[id]` - Delete document

### 3. Email Integration
#### Email Composer
- Full-featured email composition modal
- To, CC, BCC fields
- Subject and HTML body
- Template selection dropdown
- Variable replacement ({{name}}, {{type}}, etc.)
- Auto-population of recipient email
- Draft discard confirmation
- Activity tracking for sent emails

#### Email Templates
- Template creation and management
- Category organization (Sales, Support, Marketing)
- Variable placeholders for personalization
- Active/inactive status
- Organization-scoped templates

**API Endpoints**:
- `POST /api/emails/send` - Send email
- `GET /api/email-templates` - List templates
- `POST /api/email-templates` - Create template
- `GET /api/email-templates/[id]` - Get template
- `PATCH /api/email-templates/[id]` - Update template
- `DELETE /api/email-templates/[id]` - Delete template

### 4. Analytics Dashboard
#### Key Metrics
- Total pipeline value
- Won revenue
- Win rate percentage
- Open tasks count
- Overdue tasks count
- Task completion rate
- Total accounts, contacts, aircraft

#### Visualizations
- **Monthly Opportunity Trend**: Line chart showing opportunity count and value over 6 months
- **Opportunities by Stage**: Pie chart distribution
- **Accounts by Type**: Bar chart breakdown
- **Aircraft by Status**: Bar chart visualization

#### Dashboard Sections
- Primary KPI cards with icons and drill-down links
- Secondary metrics grid
- Recent opportunities list
- Recent activity timeline
- Quick action buttons for creating new records

**API Endpoint**:
- `GET /api/dashboard?organizationId={id}` - Aggregated dashboard data

### 5. Search Functionality
- Global search across all entities
- Keyboard shortcut (Cmd/Ctrl + K)
- Real-time results with debouncing
- Grouped results by entity type
- Arrow key navigation
- Search accounts, contacts, opportunities, aircraft, tasks
- Direct navigation to search results

**API Endpoint**:
- `GET /api/search?q={query}` - Search across entities

### 6. Kanban Board
- Visual opportunity pipeline
- Drag-and-drop stage changes
- Optimistic UI updates
- Stage-based columns
- Opportunity cards with key details
- Amount and status indicators
- Persistence to database

### 7. Reporting
- Pipeline analysis
- Win/loss metrics
- Top accounts by opportunity value
- Task completion statistics
- Activity summaries
- Exportable data views

## Database Schema

### Core Models
- **Organization**: Multi-tenant container
- **User**: User accounts with RBAC support
- **Team**: Team management
- **Account**: Company/customer records
- **Contact**: Individual contacts
- **Aircraft**: Aircraft registry
- **Opportunity**: Sales opportunities
- **Task**: Task management
- **Activity**: Activity logging
- **Document**: File management
- **EmailTemplate**: Email template storage
- **Trip**: Flight tracking
- **WorkOrder**: Maintenance tracking
- **ListView**: Custom list views
- **ObjectLayout**: Page layout customization

### Enums
- `AccountType`: OWNER, OPERATOR, MRO, BROKER, CHARTER_CUSTOMER, VENDOR
- `AircraftStatus`: ACTIVE, FOR_SALE, MAINTENANCE, IN_ACQUISITION, RETIRED
- `OpportunityStage`: PROSPECT, QUALIFY, PROPOSAL, NEGOTIATION, WON, LOST
- `ActivityType`: NOTE, CALL, EMAIL, MEETING, TASK_COMMENT
- `TaskStatus`: OPEN, IN_PROGRESS, BLOCKED, DONE, CANCELED

## API Structure

All API routes follow REST conventions:
- List: `GET /api/[resource]`
- Create: `POST /api/[resource]`
- Read: `GET /api/[resource]/[id]`
- Update: `PATCH /api/[resource]/[id]`
- Delete: `DELETE /api/[resource]/[id]`

## File Structure

```
app/
├── api/                    # API routes
│   ├── accounts/
│   ├── contacts/
│   ├── aircraft/
│   ├── opportunities/
│   ├── tasks/
│   ├── activities/
│   ├── documents/
│   ├── emails/
│   ├── email-templates/
│   ├── dashboard/
│   └── search/
├── components/            # Reusable components
│   ├── AppLayout.tsx
│   ├── Sidebar.tsx
│   ├── GlobalSearch.tsx
│   ├── ActivityLogDialog.tsx
│   ├── DocumentUpload.tsx
│   ├── DocumentList.tsx
│   ├── EmailComposer.tsx
│   ├── OpportunityForm.tsx
│   ├── AccountForm.tsx
│   ├── ContactForm.tsx
│   └── AircraftForm.tsx
├── accounts/             # Account pages
├── contacts/             # Contact pages
├── aircraft/             # Aircraft pages
├── opportunities/        # Opportunity pages
├── tasks/               # Task pages
├── activities/          # Activity pages
├── reports/             # Reporting pages
└── dashboard/           # Dashboard pages

prisma/
└── schema.prisma        # Database schema

public/
└── uploads/             # File storage (org-scoped)
```

## Key Features Summary

✅ **Complete CRM Foundation**
- Multi-entity management (Accounts, Contacts, Aircraft, Opportunities)
- Relationship mapping and navigation
- Activity timeline and tracking
- Task management

✅ **Document Management**
- File upload and storage
- Metadata management
- Entity-linked documents
- Download and delete

✅ **Email Integration**
- Email composer with templates
- Activity tracking
- Variable replacement
- CC/BCC support

✅ **Analytics & Reporting**
- Real-time dashboard
- Interactive charts
- Key performance indicators
- Trend analysis

✅ **Search & Navigation**
- Global search
- Quick navigation
- Keyboard shortcuts
- Grouped results

✅ **Visual Pipeline Management**
- Kanban boards
- Drag-and-drop
- Stage tracking
- Opportunity progression

## Next Steps for Production

### High Priority
1. **Authentication & Authorization**
   - NextAuth.js integration
   - Role-based access control (RBAC)
   - Organization-scoped data access
   - Protected routes

2. **Data Migration**
   - Run Prisma migrations for new models
   - Seed data for development
   - Production PostgreSQL setup

3. **Email Service Integration**
   - SendGrid/Resend/AWS SES configuration
   - Actual email sending (currently logs only)
   - Email tracking and delivery status

### Medium Priority
4. **Advanced Features**
   - Bulk operations (mass update/delete)
   - Advanced filtering and saved views
   - Custom fields
   - Workflow automation

5. **Notifications**
   - In-app notification center
   - Toast notifications
   - Email notifications
   - Browser push notifications

6. **User Experience**
   - Mobile responsive design optimization
   - Dark mode support
   - Keyboard shortcuts guide
   - Onboarding flow

### Future Enhancements
7. **Integrations**
   - Calendar integration (Google Calendar, Outlook)
   - Email sync (Gmail, Outlook)
   - Third-party APIs
   - Zapier/Make webhooks

8. **Advanced Analytics**
   - Custom report builder
   - Data export (CSV, Excel, PDF)
   - Scheduled reports
   - Forecasting

9. **Collaboration**
   - Comments and mentions
   - Real-time updates
   - Team collaboration features
   - Document sharing

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"              # SQLite for development
# DATABASE_URL="postgresql://..."         # PostgreSQL for production
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations
- Server-side rendering for initial page loads
- Client-side navigation for instant transitions
- API request parallelization
- Debounced search queries
- Optimistic UI updates
- Lazy loading for large lists

## Security Considerations
- Input validation on all forms
- SQL injection protection via Prisma
- XSS prevention
- CSRF protection
- File upload size limits
- Organization-scoped data access

---

**Built with ❤️ using Next.js, React, and Prisma**
