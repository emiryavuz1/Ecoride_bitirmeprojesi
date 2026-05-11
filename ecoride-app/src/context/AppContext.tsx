import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  userEmail: string;
  session: Session | null;
  setIsLoggedIn: (loggedIn: boolean, name?: string) => void;
  setSession: (session: Session | null) => void;
  refreshProfile: () => Promise<void>;
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
  const [userEmail, setUserEmail] = useState('');
  const [session, setSessionState] = useState<Session | null>(null);

  // Session kontrolü: başlangıçta mevcut oturumu kontrol et
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessionState(data.session);
        setIsLoggedInState(true);
        setUserEmail(data.session.user.email || '');
        setUserName(data.session.user.email?.split('@')[0] || 'Kullanıcı');
      }
    };
    
    checkSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSessionState(session);
        setIsLoggedInState(true);
        setUserEmail(session.user.email || '');
        setUserName(session.user.email?.split('@')[0] || 'Kullanıcı');
      } else {
        setSessionState(null);
        setIsLoggedInState(false);
        setUserEmail('');
        setUserName('Ali Yılmaz');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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

  const setSession = useCallback((newSession: Session | null) => {
    setSessionState(newSession);
    if (!newSession) {
      // Oturum kapandı - state'i sıfırla
      setIsLoggedInState(false);
      setUserEmail('');
      setUserName('Ali Yılmaz');
      setPoints(150);
      setTrashCount(12);
      setHistory([]);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Kullanıcının profil bilgisini çek
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('points, trash_count')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profil veri çekme hatası:', profileError);
        return;
      }

      if (profileData) {
        setPoints(profileData.points || 0);
        setTrashCount(profileData.trash_count || 0);
      }

      // Son aktiviteleri çek
      const { data: historyData, error: historyError } = await supabase
        .from('point_transactions')
        .select('id, type, amount, created_at, label')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) {
        console.error('Aktivite veri çekme hatası:', historyError);
        return;
      }

      if (historyData) {
        const mappedHistory = historyData.map((item: any) => ({
          type: item.type === 'earned' ? 'earned' : 'spent',
          amount: item.amount,
          date: new Date(item.created_at).toLocaleDateString('tr-TR'),
          label: item.label || 'İşlem',
        }));
        setHistory(mappedHistory);
      }
    } catch (err) {
      console.error('refreshProfile hatası:', err);
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
    userEmail,
    session,
    setIsLoggedIn,
    setSession,
    refreshProfile,
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
