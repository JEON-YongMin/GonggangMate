import { api } from './api';
import { Course, Gap, GapSummary, Semester } from '@/types/user.types';

export const timetableService = {
  getActiveSemester: async (userId: number): Promise<Semester> => {
    const res = await api.get<Semester>(`/users/${userId}/semesters/active`);
    return res.data.data;
  },
  createSemester: async (userId: number, year: number, semesterName: string): Promise<Semester> => {
    const res = await api.post<Semester>(`/users/${userId}/semesters`, { year, semesterName });
    return res.data.data;
  },
  getCourses: async (semesterId: number): Promise<Course[]> => {
    const res = await api.get<Course[]>(`/semesters/${semesterId}/courses`);
    return res.data.data;
  },
  createCourse: async (semesterId: number, data: Partial<Course>): Promise<Course> => {
    const res = await api.post<Course>(`/semesters/${semesterId}/courses`, data);
    return res.data.data;
  },
  updateCourse: async (courseId: number, data: Partial<Course>): Promise<Course> => {
    const res = await api.put<Course>(`/courses/${courseId}`, data);
    return res.data.data;
  },
  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/courses/${courseId}`);
  },
  getTodayGaps: async (userId: number): Promise<Gap[]> => {
    const res = await api.get<Gap[]>(`/users/${userId}/gaps/today`);
    return res.data.data;
  },
  getWeeklyGaps: async (userId: number): Promise<Gap[]> => {
    const res = await api.get<Gap[]>(`/users/${userId}/gaps/weekly`);
    return res.data.data;
  },
  getGapSummary: async (userId: number): Promise<GapSummary> => {
    const res = await api.get<GapSummary>(`/users/${userId}/gaps/summary`);
    return res.data.data;
  },
};
