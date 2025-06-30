# Gemini API Integration

This document explains how the Gemini API has been integrated into the application.

## Setup

1. The Gemini API key has been added to the `.env` file:
   ```
   GEMINI_API_KEY=AIzaSyA2PscjCl8GQysFb6ZusclLtF2wV--3F0Y
   ```

2. The Next.js configuration (`next.config.js`) has been updated to:
   - Remove the static export option to enable API routes
   - Make the API key available to the client-side code

3. A new API route has been created at `app/api/gemini/route.ts` to handle requests to the Gemini API

4. A test component has been added at `components/gemini-test.tsx` and integrated into the dashboard page

## Usage

### API Endpoint

You can make POST requests to `/api/gemini` with the following structure:

```json
{
  "prompt": "Your prompt text here"
}
```

The API will return the response from the Gemini API.

### Test Component

A test component has been added to the dashboard page where you can:
1. Enter a prompt
2. Submit it to the Gemini API
3. View the response

## Example API Call

```javascript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: 'Explain how AI works' }),
});

const data = await response.json();
// The response text is in data.candidates[0].content.parts[0].text
```

## Direct API Call (for reference)

You can also call the Gemini API directly using the following curl command:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works"}]
    }]
   }'
```

## Security Considerations

- The API key is stored in the `.env` file, which should not be committed to version control
- Server-side API calls are preferred to avoid exposing the API key to clients
- The current implementation exposes the API key to the client through Next.js environment variables, which is acceptable for development but should be reconsidered for production# Gemini API Integration

This document explains how the Gemini API has been integrated into the application.

## Setup

1. The Gemini API key has been added to the `.env` file:
   ```
   GEMINI_API_KEY=AIzaSyA2PscjCl8GQysFb6ZusclLtF2wV--3F0Y
   ```

2. The Next.js configuration (`next.config.js`) has been updated to:
   - Remove the static export option to enable API routes
   - Make the API key available to the client-side code

3. A new API route has been created at `app/api/gemini/route.ts` to handle requests to the Gemini API

4. A test component has been added at `components/gemini-test.tsx` and integrated into the dashboard page

## Usage

### API Endpoint

You can make POST requests to `/api/gemini` with the following structure:

```json
{
  "prompt": "Your prompt text here"
}
```

The API will return the response from the Gemini API.

### Test Component

A test component has been added to the dashboard page where you can:
1. Enter a prompt
2. Submit it to the Gemini API
3. View the response

## Example API Call

```javascript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: 'Explain how AI works' }),
});

const data = await response.json();
// The response text is in data.candidates[0].content.parts[0].text
```

## Direct API Call (for reference)

You can also call the Gemini API directly using the following curl command:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works"}]
    }]
   }'
```

## Security Considerations

- The API key is stored in the `.env` file, which should not be committed to version control
- Server-side API calls are preferred to avoid exposing the API key to clients
- The current implementation exposes the API key to the client through Next.js environment variables, which is acceptable for development but should be reconsidered for production