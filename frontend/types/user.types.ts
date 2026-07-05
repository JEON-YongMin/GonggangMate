export interface School {
  id: number;
  name: string;
  campusName: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface InterestTag {
  id: number;
  tagName: string;
  category: string;
  iconEmoji: string;
}

export interface User {
  id: number;
  nickname: string;
  schoolId: number | null;
  schoolName: string | null;
  department: string | null;
  onboardingCompleted: boolean;
}

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  hasSchool: boolean;
  hasTimetable: boolean;
  hasInterestTags: boolean;
}

export interface Semester {
  id: number;
  year: number;
  semesterName: string;
  isActive: boolean;
}

export interface Course {
  id: number;
  semesterId: number;
  name: string;
  dayOfWeek: string;
  dayOfWeekDisplay: string;
  startTime: string;
  endTime: string;
  classroom: string | null;
  colorCode: string;
}

export interface Gap {
  id: number;
  dayOfWeek: string;
  dayOfWeekDisplay: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  gapType: 'SHORT' | 'VALID' | 'RELAXED' | 'FREE_DAY';
  gapTypeDisplay: string;
}

export interface GapSummary {
  hasTimetable: boolean;
  hasGapToday: boolean;
  totalGapCount: number;
  totalGapMinutes: number;
  nextGapStartTime: string | null;
  nextGapDisplay: string;
  todayGaps: Gap[];
}

export interface RecommendationItem {
  id: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  reasonText: string;
  weatherCondition: string;
  score: number;
  popularity: number;
}
