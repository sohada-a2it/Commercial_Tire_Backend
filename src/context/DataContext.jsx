"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import dataService from '@/services/dataService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preload data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await dataService.getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const value = {
    categories,
    loading,
    error,
    dataService, // Expose service for direct access to helper methods
    refreshData: async () => {
      dataService.clearCache();
      const data = await dataService.getCategories();
      setCategories(data);
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
