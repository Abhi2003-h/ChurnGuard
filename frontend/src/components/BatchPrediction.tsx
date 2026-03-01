import { useState, useRef, useCallback } from 'react'
import { Upload, Download, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { predictBatch } from '@/api/client'
import { cn } from '@/lib/utils'
import type { BatchRow } from '@/types'

function downloadCsv(rows: BatchRow[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function BatchPrediction() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<BatchRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResults(null)
    setError(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  async function handlePredict() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await predictBatch(file)
      setResults(data)
    } catch {
      setError('Prediction failed. Check that the CSV matches the expected format.')
    } finally {
      setLoading(false)
    }
  }

  const churnCount = results?.filter((r) => r.prediction === 1).length ?? 0
  const displayCols = results
    ? Object.keys(results[0]).filter((k) => k !== 'prediction' && k !== 'probability').slice(0, 6)
    : []

  return (
    <div className="space-y-4 w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CSV Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-24 cursor-pointer transition-colors',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            )}
          >
            <Upload size={28} className="text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {file ? file.name : 'Drop a CSV file here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Must be in BigML telecom churn format
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <Button onClick={handlePredict} disabled={!file || loading} className="w-full">
            {loading ? 'Running predictions…' : 'Predict All'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">
              Results — {churnCount} churners out of {results.length} customers
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCsv(results, 'churn_predictions.csv')}
              className="flex items-center gap-2"
            >
              <Download size={14} />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[460px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary border-b border-border">
                  <tr>
                    {displayCols.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Probability</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-border/50',
                        row.prediction === 1 ? 'bg-red-500/5' : 'bg-green-500/5'
                      )}
                    >
                      {displayCols.map((col) => (
                        <td key={col} className="px-3 py-1.5 whitespace-nowrap">
                          {String(row[col])}
                        </td>
                      ))}
                      <td className="px-3 py-1.5">
                        {(Number(row.probability) * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge variant={row.prediction === 1 ? 'destructive' : 'secondary'}>
                          {row.prediction === 1 ? 'Churn' : 'Stay'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
