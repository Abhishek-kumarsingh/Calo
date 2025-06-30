'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TestTokenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>('test-token-value');

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const saveToken = () => {
    localStorage.setItem('token', manualToken);
    setToken(manualToken);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const testApi = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      alert(response.ok ? 'API call successful!' : `API call failed: ${data.message}`);
    } catch (error) {
      console.error('API call error:', error);
      alert(`API call error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Token Test Page</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Current Token Status</h2>
        <p>Token in localStorage: {token ? `"${token}"` : 'Not found'}</p>
      </div>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Manage Token</h2>
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            value={manualToken} 
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Enter token value"
          />
          <Button onClick={saveToken}>Save Token</Button>
          <Button variant="destructive" onClick={clearToken}>Clear Token</Button>
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Test API Call</h2>
        <Button onClick={testApi} disabled={!token}>
          Test API with Token
        </Button>
      </div>
      
      <div className="mt-8">
        <a href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
