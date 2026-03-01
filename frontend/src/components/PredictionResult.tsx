import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecommendationCard } from './RecommendationCard'
import type { PredictResponse } from '@/types'

interface PredictionResultProps {
  result: PredictResponse
}

export function PredictionResult({ result }: PredictionResultProps) {
  const pct = Math.round(result.probability * 100)
  const willChurn = result.prediction === 1

  // Semi-circle gauge data
  const gaugeData = [
    { value: pct },
    { value: 100 - pct },
  ]

  return (
    <div className="space-y-4">
      {/* Verdict + gauge */}
      <Card className={willChurn ? 'border-red-200' : 'border-green-200'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Prediction Result</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-24">
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={55}
                  outerRadius={75}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={willChurn ? '#dc2626' : '#16a34a'} />
                  <Cell fill="#e4e4e7" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-2xl font-bold">{pct}%</span>
            </div>
          </div>

          <div
            className={`text-2xl font-bold tracking-wide px-6 py-3 rounded-lg ${
              willChurn
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {willChurn ? 'WILL CHURN' : 'WILL NOT CHURN'}
          </div>

          <p className="text-sm text-muted-foreground">
            Churn probability: <strong>{(result.probability * 100).toFixed(2)}%</strong>
          </p>
        </CardContent>
      </Card>

      <RecommendationCard recommendations={result.recommendations} />
    </div>
  )
}
