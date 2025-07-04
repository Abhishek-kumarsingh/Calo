# Calo Interview Platform Information

## Summary
A modern, full-stack interview management and analytics platform built with Next.js, MongoDB, and advanced AI integrations (Gemini). Designed for scalability, extensibility, and beautiful user experience.

## Structure
- **app/**: Next.js App Router pages and API routes
- **components/**: UI components organized by feature (admin, interview, dashboard, etc.)
- **contexts/**: React context providers for state management
- **hooks/**: Custom React hooks for shared functionality
- **lib/**: Core utilities, database models, and services
- **scripts/**: Utility scripts for data management and setup

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: Node.js (implied by Next.js 13.5.1)
**Build System**: Next.js
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- Next.js 13.5.1: React framework
- MongoDB/Mongoose 8.15.0: Database and ORM
- next-auth 4.24.11: Authentication framework
- @google/generative-ai 0.24.1: Gemini AI integration
- @aws-sdk/credential-providers 3.840.0: AWS integration
- bcrypt 6.0.0: Password hashing
- mongodb-client-encryption 6.4.0: MongoDB encryption
- Radix UI components: Accessible UI primitives
- Tailwind CSS 3.3.3: Utility-first CSS framework
- kerberos 2.2.2: Authentication protocol
- gcp-metadata 5.3.0: Google Cloud Platform metadata
- snappy 7.2.2: Compression library
- socks 2.8.5: SOCKS proxy client

**Development Dependencies**:
- TypeScript 5.8.3: Static typing
- ESLint 8.49.0: Code linting
- Various type definitions (@types/*)

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Create admin user
npm run create-admin

# Update admin password
npm run update-admin-password

# Data migration
npm run migrate
```

## Database
**Type**: MongoDB
**Connection**: Mongoose ORM
**Security**: Client-side encryption support
**Models**:
- User: Authentication and user management
- Interview: Interview sessions and questions
- Candidate: Candidate profiles
- Message: Chat messages
- Question/QuestionBank: Question repository
- SystemLog: System activity logging

## Authentication
**Framework**: NextAuth.js
**Features**:
- JWT-based authentication
- Two-factor authentication
- Role-based access control (user/admin)
- Session management
- Kerberos authentication support

## API Structure
**Routes**: RESTful API routes in app/api/
- /api/auth: Authentication endpoints
- /api/interviews: Interview management
- /api/candidates: Candidate management
- /api/gemini: AI integration

## Cloud Integration
**AWS**: Credential providers for AWS services
**GCP**: Metadata service integration for Google Cloud

## AI Integration
**Provider**: Google Gemini
**Configuration**: API key in environment variables
**Features**: Question generation, interview assistance

## Key Features
- Admin dashboard for interview management
- Real-time analytics and reporting
- AI-powered question generation
- Secure authentication with 2FA
- Question banks and export/import
- Candidate management
- Scheduling and live interviews
- Responsive, modern UI