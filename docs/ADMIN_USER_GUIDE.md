# Admin User Management Guide

This guide details the complete workflow for adding new users to the NyxUs Dev admin panel, including security protocols, database operations, and frontend procedures.

## 1. Overview

The user management system uses **Supabase Auth** for identity management and **Row Level Security (RLS)** for access control. The process involves:
1.  **Invitation:** An admin triggers an invitation via the Admin UI.
2.  **Creation:** A server-side action creates the user in Supabase Auth with specific metadata.
3.  **Profile:** A corresponding public profile is created in the `profiles` table.
4.  **Notification:** An email is sent to the user with temporary credentials.
5.  **First Login:** The user logs in and is forced to change their password.

## 2. Security & Roles

Access is controlled via `user_metadata.role` assigned during user creation.

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full access: Create/Delete users, Manage content, Chat, System Config. |
| **Member** | Standard access: Manage content, Chat. Cannot manage users. |
| **Viewer** | Read-only access to Admin Panel. |

### Security Layers
1.  **Middleware Proxy (`src/proxy.ts`):** 
    *   Protects `/admin/*` routes.
    *   Verifies user is authenticated.
    *   Checks for valid role (`admin`, `member`, `viewer`).
2.  **Server Actions (`src/actions/chat-system.ts`):**
    *   `createTeamMember`: Checks `user_metadata.role === 'admin'`.
    *   `deleteTeamMember`: Checks `user_metadata.role === 'admin'`.
    *   `sendMessage`: Verifies conversation membership.

## 3. Step-by-Step Workflow

### A. Frontend Procedure (Admin UI)
**File:** `src/components/admin/user-management.tsx`

1.  **Navigation:** Admin navigates to `/admin/users`.
2.  **Trigger:** Clicks "Invite Member" button.
3.  **Form Input:**
    *   First Name & Last Name (Generates `display_name`)
    *   Email Address
    *   Role (Dropdown: Admin/Member/Viewer)
    *   Bio (Optional)
4.  **Submission:** `createTeamMember` server action is called.
5.  **Feedback:**
    *   **Success:** A dialog appears showing the **Temporary Password**. This is the *only* time it is displayed in the UI.
    *   **Error:** Toast notification displays failure reason (e.g., "Email already exists").

### B. Backend Execution (Server Action)
**File:** `src/actions/chat-system.ts` -> `createTeamMember()`

1.  **Authentication Check:**
    ```typescript
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') throw new Error('Unauthorized');
    ```
2.  **Admin Client Initialization:**
    Uses `createAdminClient()` (requires `SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS for user creation.
3.  **Password Generation:**
    Generates a secure 12-character alphanumeric+special password.
4.  **Supabase User Creation:**
    Calls `adminSupabase.auth.admin.createUser()`:
    *   Sets `email` and `password`.
    *   Sets `email_confirm: true` (auto-confirmed).
    *   Sets `user_metadata`: `{ role: '...', display_name: '...', ... }`.
5.  **Profile Creation:**
    Inserts a row into the `profiles` table:
    *   `id`: Matches Auth User ID.
    *   `force_password_change: true`.
6.  **Email Notification:**
    Calls `sendInvitationEmail` (Resend API) to send credentials.

### C. First Login & Verification
**File:** `src/components/auth/password-change-modal.tsx`

1.  User logs in at `/login`.
2.  `AdminLayout` checks `user.user_metadata.force_password_change` (or profile column).
3.  If `true`, the **Change Password Modal** blocks the screen.
4.  User updates password -> `updatePassword` action sets `force_password_change` to `false`.

## 4. Database & Configuration

### Required Environment Variables
Ensure these are set in `.env.local` (and production environment):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # CRITICAL for admin actions
RESEND_API_KEY=re_123... # For email delivery
```

### Database Schema (Profiles)
The `profiles` table must exist with these columns:
*   `id` (uuid, references auth.users)
*   `email` (text)
*   `display_name` (text)
*   `role` (text) - *Note: Role is primarily stored in Auth Metadata, mirrored here for RLS policies if needed.*
*   `force_password_change` (boolean)

## 5. Verification Steps

To verify the system is working securely:

1.  **Attempt Unauthorized Creation:**
    *   Log in as a standard "Member".
    *   Try to call `createTeamMember` (via console or crafted request).
    *   **Expected Result:** Server error "Unauthorized: Admin privileges required".

2.  **Verify Admin Access:**
    *   Log in as "Admin".
    *   Invite a new user.
    *   **Expected Result:** Success dialog, email received (or mocked in logs).

3.  **Verify Access Control:**
    *   New user logs in.
    *   Try to access `/admin/users`.
    *   **Expected Result:** UI should hide/disable "Invite" button or server should reject actions if they try. (Note: Currently UI visibility logic should be updated to check role).

## 6. Troubleshooting

*   **"Missing API Key" Build Error:** Check `src/lib/email.ts` fallback.
*   **"Unauthorized" on Invite:** Ensure your current user has `role: 'admin'` in metadata. You may need to manually update your bootstrap admin user in the Supabase Dashboard:
    *   Go to **Authentication > Users**.
    *   Edit User > Metadata.
    *   Add JSON: `{"role": "admin"}`.
