# SocioFix — Society Maintenance Tracker (Frontend)

A production-ready React 19 + Vite frontend for the SocioFix FastAPI backend.

## Stack

- React 19 + Vite
- Tailwind CSS (blue/white theme)
- React Router DOM v7
- Axios (with JWT bearer interceptor)
- React Hook Form
- React Hot Toast
- Lucide React icons
- Context API for auth state (no Redux)

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your FastAPI backend
npm run dev
```

The app expects the backend at `VITE_API_BASE_URL` (default `http://localhost:8000`), and calls
`${VITE_API_BASE_URL}/api/...` for every request.

## Auth

- JWT is stored in `localStorage` under `sociofix_token`; the cached user profile under `sociofix_user`.
- `src/api/axios.js` attaches `Authorization: Bearer <token>` to every request and auto-redirects
  to `/login` on a 401 response.
- `src/context/AuthContext.jsx` exposes `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`.

## Roles

The backend's user object may expose the resident/admin distinction as `role`, `user_type`, or an
`is_admin` boolean. `src/utils/roles.js` normalizes this into a single `isAdminUser(user)` helper.
Admins get:
- The all-complaints view (`GET /api/complaints` with filters) instead of "my complaints".
- Inline controls on the complaint details page to update **status** and **priority**.
- Create/edit/delete controls on the Notice Board.

Residents only see their own complaints and can create/edit/delete their own complaints, and read notices.

## API surface used

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Complaints** — `POST /api/complaints`, `GET /api/complaints` (filters: `status`, `priority`,
`category`, `block`, `date`, `search`), `GET /api/complaints/my`, `GET /api/complaints/{id}`,
`PUT /api/complaints/{id}`, `DELETE /api/complaints/{id}`, `PATCH /api/complaints/{id}/status`,
`PATCH /api/complaints/{id}/priority`

**Notices** — `GET /api/notices`, `GET /api/notices/pinned`, `POST /api/notices`,
`PUT /api/notices/{id}`, `DELETE /api/notices/{id}`

**Dashboard** — `GET /api/dashboard` → expected shape:
```json
{
  "total_complaints": 0,
  "pending": 0,
  "in_progress": 0,
  "resolved": 0,
  "overdue_complaints": 0,
  "high_priority_complaints": 0,
  "total_notices": 0,
  "pinned_notices": 0,
  "complaints_by_category": { "Plumbing": 0 },
  "recent_complaints": [],
  "recent_notices": []
}
```

Complaint objects are expected to optionally include a `history` array, each entry shaped as
`{ status, actor, note, timestamp }`, rendered as a timeline on the Complaint Details page.

## Folder structure

```
src/
  api/            axios instance + one module per resource
  context/        AuthContext (Context API)
  components/
    common/       Spinner, ProtectedRoute, PublicRoute, StatusBadge, EmptyState, ConfirmModal
    layout/       Navbar, Sidebar, DashboardLayout
  pages/          one file per route
  utils/          role-checking helper
```

## Notes

- No backend code, mock data, or fake APIs are included — this is a pure frontend client.
- No TypeScript, Redux, Material UI, or Bootstrap.
