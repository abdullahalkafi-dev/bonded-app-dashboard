# AGENTS.md — Bonded Admin Dashboard

## Project Overview

Admin dashboard for the Bonded app. Manages External Events, Public Circles, and Marketplace Products.
Built for **admin/superAdmin** roles only — no public user registration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| State | Redux Toolkit + RTK Query |
| Styling | Tailwind CSS v4 |
| UI Kit | shadcn/ui (New York style, neutral palette) |
| Language | TypeScript (strict) |
| Package Manager | pnpm |
| Auth | JWT (accessToken + refreshToken in localStorage) |

---

## Commands

```bash
pnpm install            # install dependencies
pnpm dev                # start dev server (http://localhost:3000)
pnpm build              # production build
pnpm lint               # run ESLint
npx shadcn@latest add <component>  # add shadcn components
```

No test framework. Skip all test files.

---

## Environment Variables

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5002/api/v1
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root HTML + font + providers
│   ├── page.tsx                    # Redirect → /login
│   ├── login/page.tsx              # Admin login
│   └── dashboard/
│       ├── layout.tsx              # Sidebar + topbar shell
│       ├── page.tsx                # Overview / stats
│       ├── circles/page.tsx        # Circles CRUD
│       ├── events/page.tsx         # External Events CRUD
│       └── marketplace/page.tsx    # Marketplace CRUD
│
├── components/
│   ├── ui/                         # shadcn primitives (DO NOT edit manually)
│   ├── layout/
│   │   ├── sidebar.tsx             # App sidebar navigation
│   │   └── topbar.tsx              # Top bar with user info + logout
│   ├── data-table/
│   │   ├── index.tsx               # Reusable <DataTable>
│   │   ├── pagination.tsx          # Table pagination controls
│   │   └── types.ts                # ColumnDef, DataTableProps
│   ├── crud-dialog.tsx             # Reusable create/edit dialog
│   ├── confirm-dialog.tsx          # Delete confirmation dialog
│   ├── image-upload.tsx            # Image upload with preview
│   └── search-filter-bar.tsx       # Search input + filter dropdowns
│
├── config/
│   └── sidebar.ts                  # Sidebar navigation entries
│
├── lib/
│   ├── api-client.ts               # Fetch wrapper (base URL, auth, token refresh)
│   └── utils.ts                    # cn(), formatDate, etc.
│
├── store/
│   ├── index.ts                    # configureStore (register all API slices)
│   └── api/
│       ├── base-api.ts             # createApi + fetchBaseQuery
│       ├── auth-api.ts             # login, refreshToken
│       ├── interests-api.ts        # getInterests (for dropdowns)
│       ├── circles-api.ts          # admin circles CRUD
│       ├── events-api.ts           # admin external events CRUD
│       └── marketplace-api.ts      # admin marketplace CRUD
│
└── types/
    └── api.ts                      # Shared API response types
```

---

## Architecture Patterns

### API Layer (RTK Query)

Every module follows the same pattern:

```ts
// store/api/<module>-api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./base-api";

export const <module>Api = createApi({
  reducerPath: "<module>Api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["<Module>"],
  endpoints: (builder) => ({
    get<Module>s: builder.query({
      query: (params) => ({ url: "/admin/<module>", params }),
      providesTags: ["<Module>"],
    }),
    create<Module>: builder.mutation({
      query: (body) => ({ url: "/admin/<module>", method: "POST", body }),
      invalidatesTags: ["<Module>"],
    }),
    update<Module>: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/<module>/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["<Module>"],
    }),
    delete<Module>: builder.mutation({
      query: (id) => ({
        url: `/admin/<module>/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["<Module>"],
    }),
  }),
});
```

### Adding a New Module (4 steps)

1. **API slice** — create `src/store/api/<module>-api.ts` (copy an existing one)
2. **Page** — create `src/app/dashboard/<module>/page.tsx` (copy an existing page, adjust columns/fields)
3. **Sidebar** — add entry in `src/config/sidebar.ts`
4. **Store** — register the new API slice in `src/store/index.ts`

### Page Pattern

Every CRUD page follows this structure:

```tsx
"use client";

export default function <Module>Page() {
  // 1. State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 2. RTK Query hooks
  const { data, isLoading } = useGet<Module>sQuery({ page, search, ...filters });
  const [create<Module>] = useCreate<Module>Mutation();
  const [update<Module>] = useUpdate<Module>Mutation();
  const [delete<Module>] = useDelete<Module>Mutation();

  // 3. Render: SearchFilterBar → DataTable → CrudDialog + ConfirmDialog
}
```

---

## UI Guidelines — POLISH IS MANDATORY

### Non-Negotiable Rules

1. **No broken layouts.** Every component must render correctly at all viewport sizes (320px → 2560px).
2. **No visual artifacts.** No overlapping elements, no text overflow, no truncated content without tooltips, no invisible scroll areas.
3. **No weird buttons.** All buttons must have consistent padding, rounded corners, and clear labels. Use shadcn `Button` variants only (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`).
4. **No weird boxes.** All cards, dialogs, and panels must use shadcn `Card` or `Dialog` components. Never build custom containers.
5. **Consistent spacing.** Use Tailwind spacing scale (`gap-4`, `p-6`, `space-y-4`). Never use arbitrary pixel values.
6. **Smooth transitions.** Dialog open/close, sidebar toggle, and hover states must feel smooth. Use Tailwind `transition-all duration-200`.

### Component Library (shadcn)

Only use these shadcn components. Do not build custom alternatives:

| Purpose | Component |
|---|---|
| Buttons | `Button` |
| Cards | `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` |
| Forms | `Input`, `Label`, `Textarea`, `Select`, `Switch`, `Checkbox` |
| Tables | `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` |
| Dialogs | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` |
| Dropdowns | `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` |
| Navigation | `Sheet` (mobile sidebar), `Badge` |
| Feedback | `Skeleton` (loading states), `Toast` (via sonner) |
| Layout | `Separator` |

### Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Sidebar hidden, hamburger menu → Sheet drawer, full-width content, stacked cards |
| 768px–1024px (tablet) | Collapsed sidebar icons or Sheet, 2-column grids |
| > 1024px (desktop) | Fixed sidebar (240px), main content fluid |

### Color & Theme

- Use shadcn neutral palette (gray tones)
- Primary actions: `bg-primary text-primary-foreground`
- Destructive actions: `bg-destructive text-destructive-foreground`
- Muted text: `text-muted-foreground`
- Backgrounds: `bg-background`, `bg-muted`
- Borders: `border border-border`
- Never use hardcoded hex colors. Always use Tailwind CSS variables.

### Form Validation

- All required fields must have `aria-required` or visual indicator (red asterisk)
- Show inline error messages below inputs using `text-sm text-destructive`
- Disable submit button while mutation is loading
- Show loading spinner on submit button during API calls

### Loading States

- Table loading: show Skeleton rows (5 skeleton rows matching table structure)
- Page loading: full-page Skeleton or centered spinner
- Button loading: spinner icon inside button, button disabled

### Empty States

When a table has no data, show a centered message:
```
No [items] found.
[Create new item] button
```

### Error Handling

- API errors: show Toast notification with error message
- Form validation errors: show inline below each field
- Network errors: show Toast with "Network error. Please try again."

---

## Backend API Reference

### Base URL

All requests go to: `NEXT_PUBLIC_API_URL` (default: `http://localhost:5002/api/v1`)

### Authentication

```
Authorization: Bearer <accessToken>
```

Token refresh: `POST /api/v1/auth/refresh-access-token` with `{ refreshToken }`.

### Response Envelope

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPage": 5 }
}
```

### Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login (email + password) |
| POST | `/auth/refresh-access-token` | Refresh JWT |
| GET | `/interests` | List active interests (public) |
| GET | `/admin/circles` | List circles (paginated) |
| POST | `/admin/circles` | Create circle |
| PATCH | `/admin/circles/:circleId` | Update circle |
| DELETE | `/admin/circles/:circleId` | Soft-delete circle |
| GET | `/admin/events/external` | List external events (paginated) |
| POST | `/admin/events/external` | Create external event |
| PATCH | `/admin/events/external/:externalEventId` | Update event |
| DELETE | `/admin/events/external/:externalEventId` | Soft-delete event |
| GET | `/admin/marketplace` | List marketplace products |
| POST | `/admin/marketplace` | Create products (batch) |
| PATCH | `/admin/marketplace/:id` | Update product |
| DELETE | `/admin/marketplace/:id` | Delete product |
| POST | `/upload/image` | Upload image (multipart/form-data) |

### Detailed Schemas

See `bonded-app-backend_new/docs/dashboard-integration/` for full request/response schemas:

- `admin-external-events.md` — External Events CRUD
- `admin-public-circles.md` — Public Circles CRUD
- `admin-marketplace-integration.md` — Marketplace Products CRUD

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` | `app/dashboard/circles/page.tsx` |
| Layouts | `layout.tsx` | `app/dashboard/layout.tsx` |
| Components | `kebab-case.tsx` | `components/data-table/index.tsx` |
| API slices | `kebab-case-api.ts` | `store/api/circles-api.ts` |
| Config files | `kebab-case.ts` | `config/sidebar.ts` |
| Types | `camelCase.ts` | `types/api.ts` |

## Code Conventions

- All components are `"use client"` (client-side rendering)
- No comments in code unless absolutely necessary
- No inline styles — use Tailwind classes only
- Use `cn()` from `lib/utils.ts` for conditional classes
- Use `fetch` directly in `lib/api-client.ts`, never axios
- RTK Query for ALL API calls — no raw fetch in components
- No `any` types — use proper TypeScript interfaces

---

## Adding shadcn Components

```bash
npx shadcn@latest add button card dialog input label select separator sheet table tabs textarea badge dropdown-menu skeleton switch toast
```

---

## Common Pitfalls to Avoid

1. **Don't hardcode API URLs** — always use `NEXT_PUBLIC_API_URL`
2. **Don't store tokens in cookies** — use localStorage
3. **Don't use `window` before mount** — check for SSR safety
4. **Don't skip loading states** — every data fetch needs a skeleton/spinner
5. **Don't ignore mobile** — test at 375px width minimum
6. **Don't use raw `<table>`** — always use shadcn Table components
7. **Don't build custom dialogs** — always use shadcn Dialog
8. **Don't leave empty catch blocks** — always show user-facing error feedback
