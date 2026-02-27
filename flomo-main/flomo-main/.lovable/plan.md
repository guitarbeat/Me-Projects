# Add User Flo Data Viewer to Admin Panel

## Overview

Add a "View Flo Data" button to each user row in the User Management section. Clicking it opens an expandable section (or dialog) showing that user's period tracking data, fetched via the existing `get_user_flo_data_admin` RPC.

## Implementation

### Changes to `UserManagement.tsx`

1. **Add state** for the currently selected user whose flo data is being viewed (`viewFloUser: string | null`) and the fetched data.

2. **Add a calendar/eye icon button** next to each user row (between the role selector and delete button) that toggles flo data view for that user.

3. **Add an expandable section** below the user row (or a small inline panel) that appears when a user's flo data is toggled open, showing:
   - Total number of tracked days
   - A sorted list of dates marked as period days
   - Dates grouped by month for readability

4. **Fetch data** via `supabase.rpc('get_user_flo_data_admin', { target_user_id })` when the view button is clicked. Cache results to avoid re-fetching on toggle.

### UI Design

- **Button**: Small `Eye` icon button in the user row actions area
- **Data display**: Collapsible panel below the user row showing:
  - Summary line: "X period days tracked"
  - Month-grouped date chips/badges (e.g., "Jun 2025: 1, 3, 5, 8")
  - Loading spinner while fetching
- Keeps the compact card-based design consistent with the existing admin panel

### File Changes

| File                                      | Action     | Description                                                 |
| ----------------------------------------- | ---------- | ----------------------------------------------------------- |
| `src/components/admin/UserManagement.tsx` | **Modify** | Add flo data view button, expandable panel, and fetch logic |

### Technical Details

- Uses `supabase.rpc('get_user_flo_data_admin', { target_user_id })` which is already typed in the Supabase types
- The RPC is protected server-side (requires admin role + logs access to `profile_access_audit`)
- Data returned: `{ id, date, is_period_day, created_at, updated_at }[]`
- Group dates by year-month using `date-fns` (already installed) for clean display
- No database changes needed -- the RPC function already exists
