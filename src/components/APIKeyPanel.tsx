/**
 * API Key Panel Component
 * Handles API key input, validation, and storage
 * Requirements: 1.1, 1.4, 1.5, 1.6
 */

import { useState, useEffect, useCallback } from 'react';
import { APIKeyManager } from '@/services/APIKeyManager';

interface APIKeyPanelProps {
  onKeyValidated: (isValid: boolean) => void;
}

export function APIKeyPanel({ onKeyValidated }: APIKeyPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [isStored, setIsStored] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Load stored key on mount
  useEffect(() => {
    const storedKey = APIKeyManager.retrieve();
    if (storedKey) {
      setApiKey(storedKey);
      setIsStored(true);
      // Auto-validate stored key
      validateKey(storedKey);
    }
  }, []);

  const validateKey = useCallback(async (key: string) => {
    if (!key.trim()) {
      setConnectionStatus('unknown');
      setErrorMessage(null);
      onKeyValidated(false);
      return;
    }

    // First check format
    if (!APIKeyManager.validateFormat(key)) {
      setConnectionStatus('error');
      setErrorMessage('Invalid API key format. Key should start with "AIza"');
      onKeyValidated(false);
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await APIKeyManager.testConnection(key);
      
      if (result.success) {
        setConnectionStatus('connected');
        setErrorMessage(null);
        // Store the valid key
        APIKeyManager.store(key);
        setIsStored(true);
        onKeyValidated(true);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Connection failed');
        onKeyValidated(false);
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
      onKeyValidated(false);
    } finally {
      setIsValidating(false);
    }
  }, [onKeyValidated]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    setConnectionStatus('unknown');
    setErrorMessage(null);
  };

  const handleTestConnection = () => {
    validateKey(apiKey);
  };

  const handleClearKey = () => {
    APIKeyManager.clear();
    setApiKey('');
    setIsStored(false);
    setConnectionStatus('unknown');
    setErrorMessage(null);
    onKeyValidated(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTestConnection();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Gemini API Key
        </label>
        {connectionStatus === 'connected' && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Connected
          </span>
        )}
        {connectionStatus === 'error' && (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Error
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleKeyChange}
          onKeyDown={handleKeyDown}
          placeholder="AIza..."
          className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 ${
            connectionStatus === 'error'
              ? 'border-red-300 focus:ring-red-500'
              : connectionStatus === 'connected'
              ? 'border-green-300 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showKey ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleTestConnection}
          disabled={!apiKey.trim() || isValidating}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing...
            </span>
          ) : (
            'Test Connection'
          )}
        </button>
        
        {isStored && (
          <button
            onClick={handleClearKey}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Get your API key from{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Google AI Studio
        </a>
      </p>
    </div>
  );
}
