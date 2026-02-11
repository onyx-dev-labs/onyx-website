# NyxUs Dev

## Digital Command Node

High-fidelity digital agency platform specializing in Web Architecture, Data Science, and Security.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Testing**: Vitest, React Testing Library

### Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and populate with your Supabase credentials.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

### Database Schema

See `schema.sql` for the database definition.
