'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface APIKeys {
  openaiKey?: string;
  geminiKey?: string;
}

export default function APIKeySettings() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys({
        openaiKey: data?.openaiKey || '',
        geminiKey: data?.geminiKey || '',
      });
    } catch (err) {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeys),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API keys');
      }

      setSuccess('API keys saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API keys');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700">
          OpenAI API Key
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="openaiKey"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={apiKeys.openaiKey || ''}
            onChange={(e) => setApiKeys({ ...apiKeys, openaiKey: e.target.value })}
            placeholder="sk-..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Get your OpenAI API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500"
            >
              OpenAI Dashboard
            </a>
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700">
          Google Gemini API Key
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="geminiKey"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={apiKeys.geminiKey || ''}
            onChange={(e) => setApiKeys({ ...apiKeys, geminiKey: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Get your Gemini API key from{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save API Keys
        </button>
      </div>
    </form>
  );
} 