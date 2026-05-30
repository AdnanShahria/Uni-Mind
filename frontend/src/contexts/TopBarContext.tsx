import { createContext, useContext, useState, ReactNode } from 'react';

interface TopBarContextType {
  leftContent: ReactNode | null;
  setLeftContent: (content: ReactNode | null) => void;
  isAppFullScreen: boolean;
  setIsAppFullScreen: (v: boolean) => void;
}

export const TopBarContext = createContext<TopBarContextType>({
  leftContent: null,
  setLeftContent: () => {},
  isAppFullScreen: false,
  setIsAppFullScreen: () => {},
});

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [leftContent, setLeftContent] = useState<ReactNode | null>(null);
  const [isAppFullScreen, setIsAppFullScreen] = useState(false);
  return (
    <TopBarContext.Provider value={{ leftContent, setLeftContent, isAppFullScreen, setIsAppFullScreen }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBarContext = () => useContext(TopBarContext);
