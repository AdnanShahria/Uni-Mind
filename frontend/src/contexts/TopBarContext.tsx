import { createContext, useContext, useState, ReactNode } from 'react';

interface TopBarContextType {
  leftContent: ReactNode | null;
  setLeftContent: (content: ReactNode | null) => void;
}

export const TopBarContext = createContext<TopBarContextType>({
  leftContent: null,
  setLeftContent: () => {},
});

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [leftContent, setLeftContent] = useState<ReactNode | null>(null);
  return (
    <TopBarContext.Provider value={{ leftContent, setLeftContent }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBarContext = () => useContext(TopBarContext);
