import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 전역 상태 타입 정의
interface AppState {
  // 테마 관련
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // 사용자 관련 (나중에 Supabase Auth와 연동 가능)
  user: {
    email: string;
    name: string;
  } | null;
  setUser: (user: { email: string; name: string } | null) => void;
  
  // 관리자 인증 상태
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 초기 상태
      theme: 'light',
      user: null,
      isAdmin: false,
      
      // Actions
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      
      setUser: (user) => set({ user }),
      
      setIsAdmin: (isAdmin) => set({ isAdmin }),
    }),
    {
      name: 'app-storage', // localStorage 키
    }
  )
);

// 편의 훅
export const useTheme = () => {
  const { theme, toggleTheme } = useStore();
  return { theme, toggleTheme };
};

export const useUser = () => {
  const { user, setUser } = useStore();
  return { user, setUser };
};

export const useAuth = () => {
  const { isAdmin, setIsAdmin } = useStore();
  return { isAdmin, setIsAdmin };
};
