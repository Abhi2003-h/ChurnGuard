import axios from 'axios'
import type { ModelStats, PredictRequest, PredictResponse, BatchRow } from '@/types'

// In development set VITE_API_URL=http://localhost:8000 in frontend/.env.local
// In Vercel production leave unset — requests go to the same origin via rewrites
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

export async function getModelStats(): Promise<ModelStats> {
  const { data } = await api.get<ModelStats>('/api/model-stats')
  return data
}

export async function predictSingle(request: PredictRequest): Promise<PredictResponse> {
  const { data } = await api.post<PredictResponse>('/api/predict', request)
  return data
}

export async function predictBatch(file: File): Promise<BatchRow[]> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<BatchRow[]>('/api/predict-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
