'use client';

import React from 'react';
import { Button } from './button';
import { Card } from './card';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="max-w-md mx-auto mt-8 p-6">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          {error?.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Please try again or contact support if the problem persists.
      </div>

      <div className="mt-6 flex gap-4">
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} variant="outline">
            Try again
          </Button>
        )}
        <Button onClick={() => window.location.reload()} variant="default">
          Refresh page
        </Button>
      </div>
    </Card>
  );
}