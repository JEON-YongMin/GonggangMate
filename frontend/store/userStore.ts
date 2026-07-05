import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, School, InterestTag } from '@/types/user.types';

interface UserState {
  userId: number | null;
  user: User | null;
  selectedSchool: School | null;
  selectedTags: InterestTag[];
  isOnboardingCompleted: boolean;
  isHydrated: boolean;
  setUserId: (id: number) => Promise<void>;
  setUser: (user: User) => void;
  setSelectedSchool: (school: School) => void;
  setSelectedTags: (tags: InterestTag[]) => void;
  completeOnboarding: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  user: null,
  selectedSchool: null,
  selectedTags: [],
  isOnboardingCompleted: false,
  isHydrated: false,

  setUserId: async (id) => {
    await AsyncStorage.setItem('userId', String(id));
    set({ userId: id });
  },
  setUser: (user) => set({ user }),
  setSelectedSchool: (school) => set({ selectedSchool: school }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  completeOnboarding: async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    set({ isOnboardingCompleted: true });
  },

  loadFromStorage: async () => {
    try {
      const results = await AsyncStorage.multiGet(['userId', 'onboardingCompleted']);
      const userId = results[0][1] ? Number(results[0][1]) : null;
      const isOnboardingCompleted = results[1][1] === 'true';
      set({ userId, isOnboardingCompleted, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.multiRemove(['userId', 'onboardingCompleted']);
    set({ userId: null, user: null, selectedSchool: null, selectedTags: [], isOnboardingCompleted: false, isHydrated: false });
  },
}));
