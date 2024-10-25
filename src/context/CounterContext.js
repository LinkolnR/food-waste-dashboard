// src/context/CounterContext.js
import React, { createContext, useState } from 'react';

export const CounterContext = createContext();

export const CounterProvider = ({ children }) => {
  const [counter, setCounter] = useState(0);

  const increment = () => setCounter((prev) => prev + 1);

  return (
    <CounterContext.Provider value={{ counter, increment }}>
      {children}
    </CounterContext.Provider>
  );
};
