# InterviewAI Platform

InterviewAI is a modern web application designed to streamline the technical interview process. It leverages AI to assist in generating questions, evaluating candidate responses, and providing insightful analytics. This platform helps organizations conduct more efficient, consistent, and data-driven interviews.

## Key Features

*   **AI-Powered Question Generation:** Create relevant interview questions based on job roles and required skills using Gemini.
*   **Comprehensive Interview Management:** Schedule, conduct, and review interviews within the platform.
*   **Live Interview Mode:** Facilitate real-time interviews with integrated coding environments and note-taking capabilities.
*   **Question Bank:** Maintain a centralized repository of questions, categorized by domain, difficulty, and type.
*   **Candidate Management:** Track candidates and their interview progress.
*   **Advanced Analytics:** Gain insights into interview performance, identify trends, and evaluate the effectiveness of your hiring process with dashboards for both overall and real-time analytics.
*   **User Roles & Permissions:** Secure access control with admin and user roles, including an impersonation feature for admins.
*   **Two-Factor Authentication (2FA):** Enhanced security for user accounts.
*   **Responsive Design:** Fully accessible on desktops, tablets, and mobile devices.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [Yarn](https://yarnpkg.com/) (or npm, though Yarn is used in `package-lock.json` which implies `yarn.lock` might be the intended lockfile, or there's a mix-up. Assuming `npm` based on `package-lock.json` for now.)
*   [MongoDB](https://www.mongodb.com/try/download/community) (ensure your MongoDB server is running)

## Getting Started

Follow these steps to get your development environment set up:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(If you prefer Yarn and have a `yarn.lock` file, use `yarn install`)*

3.  **Set up environment variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.local.example .env.local
        ```
    -   Update `.env.local` with your specific configurations, especially:
        *   `MONGODB_URI`: Your MongoDB connection string.
        *   `NEXTAUTH_SECRET`: A secret key for NextAuth.js. Generate one using `openssl rand -hex 32`.
        *   `NEXTAUTH_URL`: Your application's base URL (e.g., `http://localhost:3000`).
        *   `GEMINI_API_KEY`: Your API key for Google Gemini.
        *   *(Review other variables in `.env.local.example` and set them as needed.)*

4.  **Run database migrations/seed scripts (if applicable):**
    *   To create an initial admin user (check `scripts/` directory for more options):
        ```bash
        node scripts/create-admin-user.js youradminemail@example.com yourpassword
        ```
    *   *(Refer to scripts in the `scripts/` directory for creating demo data, e.g., `create-demo-user.js`, `create-demo-interviews.js`)*

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

6.  **Run tests:**
    *Currently, there is no dedicated test script in `package.json`. You may need to configure or add a test runner and scripts as per project requirements.*

## Project Structure Overview

*   **`app/`**: Contains all the application's routes, pages, and core layout components (using Next.js App Router).
    *   `app/api/`: API route handlers.
    *   `app/auth/`: Authentication-related pages (login, register).
    *   `app/dashboard/`: User-facing dashboard sections.
    *   `app/admin/`: Admin-specific dashboard sections.
*   **`components/`**: Shared UI components used across the application.
    *   `components/ui/`: Base UI elements, likely from a library like shadcn/ui.
    *   `components/auth/`: Authentication-specific components.
    *   `components/dashboard/`: Dashboard-specific components.
    *   `components/interview/`: Components related to interview management.
*   **`lib/`**: Core logic, utilities, database models, and services.
    *   `lib/auth.ts`: Authentication configuration and utilities (NextAuth.js).
    *   `lib/db.ts`: Database connection and utility functions.
    *   `lib/models/`: Mongoose schemas for database collections (User, Interview, QuestionBank, etc.).
    *   `lib/mongodb.ts`: MongoDB client setup.
    *   `lib/services/`: Business logic services.
*   **`config/`**: Application-level configuration files (e.g., dashboard navigation).
*   **`contexts/`**: React context providers for global state management.
*   **`docs/`**: Project documentation files.
*   **`hooks/`**: Custom React hooks.
*   **`middleware.ts`**: Next.js middleware for request processing (e.g., authentication checks).
*   **`public/`**: Static assets (images, fonts, etc.).
*   **`scripts/`**: Node.js scripts for various tasks like database seeding or user creation.
*   **`styles/`**: Global styles (though most styling is likely via Tailwind CSS and component-specific styles).
*   **`types/`**: TypeScript type definitions.

## Key Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   **AI Integration:** Google Gemini API

## Further Documentation

*   [Responsive Design System](./docs/RESPONSIVE_DESIGN.md)
*   Enhanced Dashboard Analytics (`app/dashboard/enhanced-dashboard/README.md`)
*   Real-time Analytics Dashboard (`app/dashboard/real-analytics/README.md`)
*   [Architecture Overview](./docs/ARCHITECTURE.md)

## Contributing

*(Details about contribution guidelines, code style, and pull request process can be added here if the project is open to contributions.)*

---

*This README is a starting point. Feel free to expand it with more specific details about your project setup and conventions.*
