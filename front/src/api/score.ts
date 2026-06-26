import { del, get, post, put } from '@/utils/request'
import type { PageQuery, PageResult, Score, ScoreBatchRequest, ScoreRequest, ScoreStatistics, StudentScoreResponse } from '@/types'

export interface ScoreQuery extends PageQuery {
  studentId?: number
  courseId?: number
  classId?: number
  semester?: string
}

export interface ScoreStatisticsQuery {
  courseId: number
  classId?: number
  semester?: string
}

export function getScores(params: ScoreQuery): Promise<PageResult<StudentScoreResponse>> {
  return get<PageResult<StudentScoreResponse>>('/scores', { params })
}

export function getScore(id: number): Promise<StudentScoreResponse> {
  return get<StudentScoreResponse>(`/scores/${id}`)
}

export function createScore(data: ScoreRequest): Promise<Score> {
  return post<Score>('/scores', data)
}

export function batchCreateScores(data: ScoreBatchRequest): Promise<void> {
  return post<void>('/scores/batch', data)
}

export function updateScore(id: number, data: ScoreRequest): Promise<Score> {
  return put<Score>(`/scores/${id}`, data)
}

/** 审核成绩（approved 为 Query 参数） */
export function auditScore(id: number, approved: boolean): Promise<Score> {
  return put<Score>(`/scores/${id}/audit`, undefined, { params: { approved } })
}

export function getScoreStatistics(params: ScoreStatisticsQuery): Promise<ScoreStatistics> {
  return get<ScoreStatistics>('/scores/statistics', { params })
}

/** 导出成绩（Blob 文件下载） */
export function exportScores(params: ScoreQuery): Promise<Blob> {
  return get<Blob>('/scores/export', { params, responseType: 'blob' })
}
