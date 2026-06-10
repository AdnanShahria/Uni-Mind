/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from 'react';

interface TopBarContextType {
  leftContent: ReactNode | null;
  setLeftContent: (content: ReactNode | null) => void;
  isAppFullScreen: boolean;
  setIsAppFullScreen: (v: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (v: string) => void;
}

export const TopBarContext = createContext<TopBarContextType>({
  leftContent: null,
  setLeftContent: () => {},
  isAppFullScreen: false,
  setIsAppFullScreen: () => {},
  globalSearchQuery: '',
  setGlobalSearchQuery: () => {},
});

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [leftContent, setLeftContent] = useState<ReactNode | null>(null);
  const [isAppFullScreen, setIsAppFullScreen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  return (
    <TopBarContext.Provider value={{ leftContent, setLeftContent, isAppFullScreen, setIsAppFullScreen, globalSearchQuery, setGlobalSearchQuery }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBarContext = () => useContext(TopBarContext);
