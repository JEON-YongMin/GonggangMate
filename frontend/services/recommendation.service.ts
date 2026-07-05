import { api } from './api';
import { RecommendationItem } from '@/types/user.types';

export const recommendationService = {
  getRecommendations: async (params: {
    userId: number;
    gapId: number;
    category?: string;
    weather?: string;
  }): Promise<RecommendationItem[]> => {
    const { userId, gapId, category, weather } = params;
    const res = await api.get<RecommendationItem[]>(
      `/users/${userId}/recommendations`,
      { gapId, category: category === '전체' ? undefined : category, weather: weather ?? 'SUNNY' }
    );
    return res.data.data;
  },
  getPopular: async (): Promise<RecommendationItem[]> => {
    const res = await api.get<RecommendationItem[]>('/recommendations/popular');
    return res.data.data;
  },
};
