import { createContext, useContext, useState } from 'react';

const DocContext = createContext();

export function DocProvider({ children }) {
  const [currentSections, setCurrentSections] = useState([]);

  return (
    <DocContext.Provider value={{ currentSections, setCurrentSections }}>
      {children}
    </DocContext.Provider>
  );
}

export function useDoc() {
  return useContext(DocContext);
}
