import React, { createContext, useState, useContext } from 'react';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [shouldUpdate, setShouldUpdate] = useState(false);

  return (
    <FoodContext.Provider value={{ shouldUpdate, setShouldUpdate }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);