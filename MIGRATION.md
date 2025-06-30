# Migration from Express/MongoDB Server to Next.js API Routes

This document outlines the steps to migrate from the Express/MongoDB server to Next.js API routes with MongoDB.

## Overview

The migration involves:

1. Moving MongoDB models to Next.js
2. Creating Next.js API routes to replace Express routes
3. Ensuring authentication works properly
4. Migrating data from the old server to the new one

## Prerequisites

- Node.js 18+ installed
- MongoDB running
- Access to the existing Express server and database

## Migration Steps

### 1. Environment Setup

1. Copy the `.env.local.example` file to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```

2. Update the environment variables in `.env.local` with your actual values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT authentication
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NEXTAUTH_SECRET`: Secret for NextAuth
   - `NEXTAUTH_URL`: URL of your Next.js app (e.g., http://localhost:3000)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Migration Script

This script will ensure your data is properly migrated:

```bash
npm run migrate
```

### 4. Start the Next.js Server

```bash
npm run dev
```

### 5. Verify the Migration

1. Check that you can log in
2. Verify that your interviews and candidates data is accessible
3. Test creating new interviews and candidates
4. Test the AI interview functionality

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check that your JWT_SECRET matches the one used in the Express server
2. Verify that the NextAuth configuration is correct
3. Check the browser console and server logs for errors

### Data Migration Issues

If data doesn't appear to be migrated correctly:

1. Check MongoDB connection string
2. Verify that the collections exist in the database
3. Run the migration script again with debugging enabled

### API Route Issues

If API routes aren't working:

1. Check the browser network tab for errors
2. Verify that the routes are correctly implemented
3. Check server logs for errors

## Rollback Plan

If you need to revert to the Express server:

1. Keep the Express server running on its original port
2. Update the `NEXT_PUBLIC_API_BASE_URL` environment variable to point to the Express server
3. Restart the Next.js server

## Post-Migration

After successful migration:

1. You can shut down the Express server
2. Remove the server directory if no longer needed
3. Update any documentation to reflect the new architecture
