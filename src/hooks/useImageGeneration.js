import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'estoicapp_image_generation';

const defaultSettings = {
  enabled: false,
  apiKey: ''
};

export default function useImageGeneration() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving image generation settings:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const toggleEnabled = useCallback((enabled) => {
    setSettings(prev => ({ ...prev, enabled }));
  }, []);

  const setApiKey = useCallback((apiKey) => {
    setSettings(prev => ({ ...prev, apiKey }));
    setError(null);
  }, []);

  const clearApiKey = useCallback(() => {
    setSettings(prev => ({ ...prev, apiKey: '', enabled: false }));
  }, []);

  const isConfigured = settings.enabled && settings.apiKey.length > 0;

  return {
    settings,
    isConfigured,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    updateSettings,
    toggleEnabled,
    setApiKey,
    clearApiKey
  };
}
