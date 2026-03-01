import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/components/Dashboard'
import { PredictionForm } from '@/components/PredictionForm'
import { BatchPrediction } from '@/components/BatchPrediction'
import { getModelStats } from '@/api/client'
import type { ModelStats } from '@/types'

type Tab = 'dashboard' | 'predict' | 'batch'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    getModelStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard stats={stats} loading={statsLoading} />
      )}
      {activeTab === 'predict' && <PredictionForm />}
      {activeTab === 'batch' && <BatchPrediction />}
    </Layout>
  )
}
