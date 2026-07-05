import { api } from './api';
import { User, OnboardingStatus, InterestTag } from '@/types/user.types';

export const userService = {
  create: async (nickname: string, schoolId?: number): Promise<User> => {
    const res = await api.post<User>('/users', { nickname, schoolId });
    return res.data.data;
  },
  getOnboardingStatus: async (userId: number): Promise<OnboardingStatus> => {
    const res = await api.get<OnboardingStatus>(`/users/${userId}/onboarding-status`);
    return res.data.data;
  },
  updateSchool: async (userId: number, schoolId: number): Promise<User> => {
    const res = await api.patch<User>(`/users/${userId}/school?schoolId=${schoolId}`);
    return res.data.data;
  },
  saveInterestTags: async (userId: number, tagIds: number[]): Promise<InterestTag[]> => {
    const res = await api.post<InterestTag[]>(`/users/${userId}/interest-tags`, { tagIds });
    return res.data.data;
  },
  completeOnboarding: async (userId: number): Promise<User> => {
    const res = await api.post<User>(`/users/${userId}/onboarding/complete`);
    return res.data.data;
  },
};
