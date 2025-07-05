import React, { createContext, useContext, useState } from 'react';

const UnsavedContext = createContext(null);

export const UnsavedProvider = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <UnsavedContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </UnsavedContext.Provider>
  );
};

// Хук для удобства
export const useUnsavedContext = () => useContext(UnsavedContext);
