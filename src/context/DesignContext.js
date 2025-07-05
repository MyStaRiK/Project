import React, { createContext, useState } from 'react';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const [design, setDesign] = useState({
    headerAlignment: 'left',
    headerColor: '#000000',
    headerFontSize: 14,
    headerFont: 'Arial',
    textAlignment: 'left',
    textColor: '#000000',
    textFontSize: 14,
    textFont: 'Arial',
    dateAlignment: 'left',
    contactAlignment: 'left',
  });

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      {children}
    </DesignContext.Provider>
  );
};
