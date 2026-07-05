import { api } from './api';
import { School } from '@/types/user.types';

export const schoolService = {
  getAll: async (): Promise<School[]> => {
    const res = await api.get<School[]>('/schools');
    return res.data.data;
  },
  search: async (keyword: string): Promise<School[]> => {
    const res = await api.get<School[]>('/schools', { q: keyword });
    return res.data.data;
  },
};
