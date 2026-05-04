import React, { createContext, useState, useCallback, ReactNode } from 'react';

export interface HistoryItem {
  type: string;
  amount: number;
  date: string;
  label: string;
}

export interface AppContextType {
  points: number;
  trashCount: number;
  history: HistoryItem[];
  addPoints: (amount: number, label: string) => void;
  spendPoints: (amount: number, label: string) => boolean;
  isLoggedIn: boolean;
  userName: string;
  setIsLoggedIn: (loggedIn: boolean, name?: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [points, setPoints] = useState(150);
  const [trashCount, setTrashCount] = useState(12);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      type: 'earned',
      amount: 50,
      date: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR'),
      label: 'Çöp atma (Plastik)',
    },
    {
      type: 'spent',
      amount: 60,
      date: new Date(Date.now() - 172800000).toLocaleDateString('tr-TR'),
      label: 'Bisiklet kiralama',
    },
  ]);
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [userName, setUserName] = useState('Ali Yılmaz');

  const addPoints = useCallback((amount: number, label: string) => {
    setPoints((prev) => prev + amount);
    setTrashCount((prev) => prev + 1);
    setHistory((prev) => [
      {
        type: 'earned',
        amount,
        date: new Date().toLocaleDateString('tr-TR'),
        label,
      },
      ...prev,
    ]);
  }, []);

  const spendPoints = useCallback((amount: number, label: string): boolean => {
    if (points >= amount) {
      setPoints((prev) => prev - amount);
      setHistory((prev) => [
        {
          type: 'spent',
          amount,
          date: new Date().toLocaleDateString('tr-TR'),
          label,
        },
        ...prev,
      ]);
      return true;
    }
    return false;
  }, [points]);

  const setIsLoggedIn = useCallback((loggedIn: boolean, name?: string) => {
    setIsLoggedInState(loggedIn);
    if (name) {
      setUserName(name);
    }
  }, []);

  const value: AppContextType = {
    points,
    trashCount,
    history,
    addPoints,
    spendPoints,
    isLoggedIn,
    userName,
    setIsLoggedIn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
