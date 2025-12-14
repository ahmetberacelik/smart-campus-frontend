/**
 * Grade Service
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, Enrollment, Transcript } from '@/types/api.types';

export interface EnterGradeRequest {
  enrollmentId: number | string;
  midtermGrade?: number;
  finalGrade?: number;
  letterGrade?: string; // AA, BA, BB, CB, CC, DC, DD, FD, FF
}

export const gradeService = {
  /**
   * Notlarım (student)
   */
  async getMyGrades(): Promise<ApiResponse<Enrollment[]>> {
    const response = await httpClient.get<ApiResponse<Enrollment[]>>(
      API_ENDPOINTS.GRADES.MY_GRADES
    );
    return response.data;
  },

  /**
   * Transkript JSON (student)
   */
  async getTranscript(): Promise<ApiResponse<Transcript>> {
    const response = await httpClient.get<ApiResponse<Transcript>>(
      API_ENDPOINTS.GRADES.TRANSCRIPT
    );
    return response.data;
  },

  /**
   * Transkript PDF (student)
   */
  async getTranscriptPdf(): Promise<Blob> {
    const response = await httpClient.get(API_ENDPOINTS.GRADES.TRANSCRIPT_PDF, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Not girişi (faculty)
   */
  async enterGrade(data: EnterGradeRequest): Promise<ApiResponse<Enrollment>> {
    const response = await httpClient.post<ApiResponse<Enrollment>>(
      API_ENDPOINTS.GRADES.CREATE,
      data
    );
    return response.data;
  },
};

