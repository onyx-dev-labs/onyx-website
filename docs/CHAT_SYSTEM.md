# Team Uplink - Chat System Documentation

Team Uplink is a real-time, encrypted team communication platform integrated into the Onyx Website Admin Dashboard. It mimics the user experience of WhatsApp with a focus on security, privacy, and team collaboration.

## Features

### Core Chat
- **Real-time Messaging**: Instant message delivery using Supabase Realtime.
- **Presence Indicators**: See who is Online/Offline in real-time.
- **Typing Indicators**: Visual feedback when someone is typing.
- **Read Receipts**: Messages are marked as read when the recipient opens the chat.
- **Group & Direct Chats**: Create 1:1 conversations or group channels.

### User Management (Admin)
- **Invite Users**: Admins can create accounts for team members.
- **Temporary Passwords**: New accounts receive a secure, random temporary password.
- **Forced Password Change**: Users are required to change their password upon first login.
- **Role-Based Access**: Chat system ensures users only see conversations they are part of.

### Profile Customization
- **Profile Settings**: Users can update their Display Name, About info, and Avatar.
- **Custom Wallpapers**: Users can set a custom background image URL for their chat interface.

### Security
- **Row Level Security (RLS)**: Database policies strictly enforce data access.
- **Privacy**: Admins cannot view private chats between other users unless explicitly added as a participant.
- **Encryption**: All data is encrypted in transit (HTTPS) and at rest (PostgreSQL).

## User Guide

### Accessing the Chat
Navigate to `/admin/chat` in the dashboard sidebar.

### Starting a Chat
1. Click the **+** (Plus) icon in the sidebar header.
2. Select a team member from the list.
3. If a chat already exists, it will open; otherwise, a new one is created.

### Editing Profile
1. Click your **Avatar** or Name in the top-left corner of the sidebar.
2. Update your details or set a wallpaper URL.
3. Click **Save Changes**.

### Admin: Adding Users
1. Navigate to `/admin/users`.
2. Click **Add Member**.
3. Enter Email and Display Name.
4. Copy the **Temporary Password** and share it securely with the user.

## Deployment

1. Ensure all environment variables are set in `.env.local` (or production env):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Required for Admin User Management)

2. Apply the database schema (see `DATABASE_SETUP.md`).

3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

- **Messages not appearing?** Check your internet connection and ensure Supabase Realtime quota is not exceeded.
- **"Unauthorized" error?** Ensure you are logged in. If the session expired, refresh the page.
- **Uploads failing?** Currently, the system supports Image URLs. Ensure the URL is publicly accessible.
