# Architecture Overview: InterviewAI Platform

This document provides a high-level overview of the InterviewAI platform's architecture.

## 1. Core Technologies

The platform is built using a modern web technology stack:

*   **Framework:** [Next.js](https://nextjs.org/) (v13.5.1) - A React framework for server-side rendering, static site generation, and API routes. The App Router is utilized for routing and layouts.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) - For static typing and improved developer experience.
*   **UI Library:** [React](https://reactjs.org/) - For building user interfaces.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) - For utility-first CSS and pre-built accessible UI components.
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v4.x) - For handling user authentication (credentials, potentially OAuth in the future) and session management.
*   **Database:** [MongoDB](https://www.mongodb.com/) - A NoSQL document database.
*   **ODM:** [Mongoose](https://mongoosejs.com/) - For modeling application data and interacting with MongoDB.
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) - For AI-powered features like question generation.
*   **State Management:** Primarily React Context API and custom React hooks. For more complex server state, React Query (or similar, like SWR) might be implicitly used or could be a future consideration, though not explicitly listed in `package.json`. Form management is handled by `react-hook-form`.

## 2. System Architecture Diagram (High-Level)

```mermaid
graph TD
    User[End User] --> Browser[Web Browser]

    subgraph "Next.js Application (Hosted on Vercel/Node.js Server)"
        Browser -- HTTPS --> NextServer[Next.js Server]
        NextServer --> AppRouter[App Router: Pages & Layouts]
        AppRouter --> ServerComponents[React Server Components]
        AppRouter --> ClientComponents[React Client Components]

        NextServer -- API Calls --> APIRoutes[API Routes (/app/api/*)]

        ClientComponents -- Client-Side Data Fetching --> APIRoutes
        ServerComponents -- Server-Side Data Fetching --> APIRoutes
        ServerComponents -- Server-Side Data Fetching --> ServicesLib[lib/services/*]

        APIRoutes -- Uses --> NextAuth[NextAuth.js for Auth]
        APIRoutes -- Uses --> ServicesLib
        APIRoutes -- Uses --> MongooseModels[lib/models/*]

        ServicesLib -- Uses --> MongooseModels
        MongooseModels -- Interacts with --> MongoDB[(MongoDB Database)]

        APIRoutes -- Calls (if AI needed) --> GeminiAPI[Google Gemini API]
        ServicesLib -- Calls (if AI needed) --> GeminiAPI
    end

    subgraph "External Services"
        MongoDB
        GeminiAPI
    end

    NextAuth -. Manages .-> SessionState[Session State / JWT]
    Browser .-> SessionState
```

## 3. Frontend Architecture

*   **Directory Structure:**
    *   `app/`: Contains all routes, pages, and layouts using the Next.js App Router.
        *   `(group)` folders are used for route groups and layouts.
        *   `page.tsx` defines the UI for a route.
        *   `layout.tsx` defines shared UI for a segment and its children.
        *   `loading.tsx`, `error.tsx` define loading and error UIs.
    *   `components/`: Contains reusable UI components.
        *   `components/ui/`: Base UI elements from shadcn/ui.
        *   Domain-specific components (e.g., `components/interview/`, `components/admin/`).
*   **Component Types:**
    *   **Server Components:** Default in the App Router. Run on the server, can fetch data directly, and are not interactive.
    *   **Client Components:** Marked with `"use client"`. Run on the client, allowing for interactivity (event handlers, state, effects).
*   **State Management:**
    *   Local component state: `useState`, `useReducer`.
    *   Shared state: React Context API (e.g., `contexts/session-provider.tsx`).
    *   Form state: `react-hook-form` with `Zod` for validation.
*   **Styling:**
    *   Tailwind CSS for utility classes.
    *   `globals.css` for base styles.
    *   `shadcn/ui` components provide pre-styled and customizable elements.
*   **Responsive Design:**
    *   Leverages Tailwind CSS's responsive prefixes.
    *   Custom responsive components and hooks are detailed in `docs/RESPONSIVE_DESIGN.md`.
*   **Client-Side Routing:** Next.js Link component (`<Link href="...">`) enables client-side navigation between pages.

## 4. Backend Architecture (API Routes)

*   **Directory Structure:** `app/api/`
    *   API routes are defined using Route Handlers within the App Router. Files like `route.ts` inside `app/api/...` define endpoints.
*   **Request Handling:** Standard HTTP methods (GET, POST, PUT, DELETE) are handled by functions within `route.ts`.
*   **Authentication & Authorization:**
    *   `NextAuth.js` is configured in `lib/auth.ts` and used in API routes to protect endpoints and manage sessions.
    *   `middleware.ts` can be used for global request processing, including redirecting unauthenticated users or checking roles.
*   **Database Interaction:**
    *   `lib/mongodb.ts`: Establishes connection to MongoDB.
    *   `lib/db.ts`: May contain utility functions for database operations (though specific content not reviewed).
    *   `lib/models/`: Mongoose schemas (e.g., `User.ts`, `Interview.ts`, `QuestionBank.ts`) define the structure of data in MongoDB.
    *   API routes use these models to perform CRUD operations.
*   **Services Layer:**
    *   `lib/services/`: Contains business logic abstracted away from the direct API route handlers (e.g., `questionBankService.ts`, `pdfExportService.ts`). This promotes separation of concerns.
*   **Error Handling:** API routes should implement robust error handling, returning appropriate HTTP status codes and error messages.
*   **AI Integration:**
    *   `app/api/gemini/route.ts` and `app/api/proxy/gemini/route.ts` suggest direct and proxied interactions with the Gemini API.
    *   The API key is managed via environment variables.

## 5. Data Models (Mongoose Schemas in `lib/models/`)

A brief overview of key data models:

*   **`User.ts`**: Stores user information, credentials (hashed passwords), roles (e.g., 'admin', 'user'), 2FA settings.
*   **`Interview.ts`**: Represents an interview session. Includes details like candidate ID, questions, feedback, scores, status (scheduled, ongoing, completed), date/time.
*   **`Question.ts`**: Represents an individual interview question. Includes question text, domain, type (e.g., coding, behavioral), difficulty, answer/solution.
*   **`QuestionBank.ts`**: A collection of questions, possibly grouped by specific roles or technologies.
*   **`Candidate.ts`**: Information about interview candidates.
*   **`ChatSession.ts`**: Likely for storing interactions with the AI assistant or chat features within an interview.
*   **`Message.ts`**: Individual messages within a chat session.
*   **`SystemLog.ts`**: For logging system events, errors, or important activities.

## 6. Key Features & Technical Implementation (High-Level)

*   **User Authentication (Login, Register, 2FA):**
    *   Frontend: `app/auth/login/`, `app/auth/register/` pages. Components in `components/auth/`.
    *   Backend: `app/api/auth/[...nextauth]/route.ts` (NextAuth.js handlers), `app/api/register/route.ts`.
    *   2FA logic in `lib/two-factor.ts` and related API routes in `app/api/auth/two-factor/` and `app/api/admin/two-factor/`.
*   **Interview Management:**
    *   Frontend: `app/dashboard/interviews/` for listing, creating, viewing details. `app/dashboard/live-interview/` for conducting interviews.
    *   Backend: `app/api/interviews/` (CRUD for interviews), `app/api/interviews/[id]/...` (specific interview actions like feedback, notes, questions).
*   **Question Bank Management:**
    *   Frontend: `app/dashboard/question-bank/`. Admin interface in `app/admin/question-bank/`.
    *   Backend: `app/api/interviews/question-banks/` (likely a typo, should be `app/api/question-banks/` or similar, but following current structure), `app/api/admin/question-bank/`. `lib/services/questionBankService.ts`.
*   **AI Assistant (Gemini Integration):**
    *   Frontend: Components like `components/ai-assistant-controls.tsx`, `components/enhanced-gemini-chat.tsx`.
    *   Backend: `app/api/gemini/route.ts` or proxied calls to the Gemini API.
*   **Analytics and Dashboards:**
    *   Frontend: `app/dashboard/analytics/`, `app/dashboard/enhanced-dashboard/`, `app/dashboard/real-analytics/`. Components use libraries like Recharts.
    *   Backend: `app/api/analytics/` routes to fetch aggregated data. Admin analytics in `app/api/admin/analytics/`.
*   **Admin Panel:**
    *   Frontend: `app/admin/` covering user management, logs, system settings.
    *   Backend: Various routes under `app/api/admin/` for admin-specific actions.

## 7. Directory Structure Highlights

*   **`app/`**: Core application (Next.js App Router).
    *   `layout.tsx`: Root layout.
    *   `page.tsx`: Landing page.
    *   `api/`: Backend API routes.
    *   `auth/`: Authentication pages.
    *   `dashboard/`: Main user dashboard.
    *   `admin/`: Admin section.
*   **`components/`**: Reusable React components.
    *   `ui/`: shadcn/ui components.
*   **`lib/`**: Shared utilities, services, database models.
    *   `auth.ts`: NextAuth.js configuration.
    *   `db.ts`, `mongodb.ts`: Database connection.
    *   `models/`: Mongoose schemas.
    *   `services/`: Business logic services.
*   **`config/`**: Application configuration (e.g., `dashboard.ts` for nav items).
*   **`contexts/`**: React Context providers.
*   **`docs/`**: Project documentation (like this file).
*   **`hooks/`**: Custom React hooks.
*   **`middleware.ts`**: Next.js middleware.
*   **`scripts/`**: Utility scripts (e.g., for creating users, migrating data).

## 8. Deployment

*   The application is configured for Next.js, making it suitable for deployment on platforms like [Vercel](https://vercel.com/) (which has native support for Next.js) or any Node.js hosting environment.
*   Environment variables (`.env.local`) are crucial for production deployment and must be configured securely on the hosting platform.

## 9. Scalability and Performance Considerations

*   **Serverless Functions:** API routes in Next.js can be deployed as serverless functions, allowing for automatic scaling.
*   **Database Indexing:** Proper indexing in MongoDB is crucial for query performance as the data grows.
*   **Caching:** Next.js offers various caching strategies (data caching, full route caching) that can be implemented to improve performance.
*   **Code Splitting:** Next.js automatically performs code splitting, so users only download the JavaScript needed for the current page.
*   **Image Optimization:** Next.js Image component (`next/image`) should be used for automatic image optimization.
*   **Load Testing:** For high-traffic applications, load testing API endpoints and database queries would be recommended.

This overview provides a foundational understanding of the InterviewAI platform's architecture. For more specific details, refer to the codebase and individual component/module documentation (if available).
```
