import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PredictionResult } from './PredictionResult'
import { predictSingle } from '@/api/client'
import type { PredictRequest, PredictResponse } from '@/types'

const defaultForm: PredictRequest = {
  account_length: 100,
  international_plan: 0,
  voice_mail_plan: 0,
  number_vmail_messages: 0,
  total_night_charge: 9.0,
  total_intl_calls: 4,
  total_intl_charge: 2.7,
  customer_service_calls: 1,
  total_charge: 45.0,
}

export function PredictionForm() {
  const [form, setForm] = useState<PredictRequest>(defaultForm)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const highServiceCalls = form.customer_service_calls > 3

  function setNum(key: keyof PredictRequest, value: string) {
    setForm((f) => ({ ...f, [key]: Number(value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await predictSingle(form)
      setResult(res)
    } catch {
      setError('Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-6 items-start">
      <div className="w-[560px] shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Account Length */}
              <div className="space-y-1.5">
                <Label htmlFor="account_length">Account Length (months)</Label>
                <Input
                  id="account_length"
                  type="number"
                  min={1}
                  max={300}
                  value={form.account_length}
                  onChange={(e) => setNum('account_length', e.target.value)}
                />
              </div>

              {/* International Plan */}
              <div className="space-y-1.5">
                <Label>International Plan</Label>
                <Select
                  value={String(form.international_plan)}
                  onValueChange={(v) => setForm((f) => ({ ...f, international_plan: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Mail Plan */}
              <div className="space-y-1.5">
                <Label>Voice Mail Plan</Label>
                <Select
                  value={String(form.voice_mail_plan)}
                  onValueChange={(v) => setForm((f) => ({ ...f, voice_mail_plan: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voicemail Messages */}
              <div className="space-y-1.5">
                <Label htmlFor="num_vmail">Number of Voicemail Messages</Label>
                <Input
                  id="num_vmail"
                  type="number"
                  min={0}
                  max={100}
                  value={form.number_vmail_messages}
                  onChange={(e) => setNum('number_vmail_messages', e.target.value)}
                />
              </div>

              {/* Total Night Charge */}
              <div className="space-y-1.5">
                <Label htmlFor="night_charge">Total Night Charge ($)</Label>
                <Input
                  id="night_charge"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.total_night_charge}
                  onChange={(e) => setNum('total_night_charge', e.target.value)}
                />
              </div>

              {/* Total Intl Calls */}
              <div className="space-y-1.5">
                <Label htmlFor="intl_calls">Total Intl Calls</Label>
                <Input
                  id="intl_calls"
                  type="number"
                  min={0}
                  max={100}
                  value={form.total_intl_calls}
                  onChange={(e) => setNum('total_intl_calls', e.target.value)}
                />
              </div>

              {/* Total Intl Charge */}
              <div className="space-y-1.5">
                <Label htmlFor="intl_charge">Total Intl Charge ($)</Label>
                <Input
                  id="intl_charge"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.total_intl_charge}
                  onChange={(e) => setNum('total_intl_charge', e.target.value)}
                />
              </div>

              {/* Customer Service Calls */}
              <div className="space-y-1.5">
                <Label htmlFor="csc">Customer Service Calls</Label>
                <Input
                  id="csc"
                  type="number"
                  min={0}
                  max={20}
                  value={form.customer_service_calls}
                  onChange={(e) => setNum('customer_service_calls', e.target.value)}
                />
                <div className="pt-0.5">
                  <Badge variant={highServiceCalls ? 'destructive' : 'secondary'}>
                    High Service Calls: {highServiceCalls ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Total Charge */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="total_charge">
                  Total Charge ($){' '}
                  <span className="text-muted-foreground font-normal text-xs">
                    (day + eve + night + intl charges)
                  </span>
                </Label>
                <Input
                  id="total_charge"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.total_charge}
                  onChange={(e) => setNum('total_charge', e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Predicting…' : 'Predict Churn'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* Right column — always visible, shows placeholder or result */}
      <div className="flex-1 min-w-0">
        {result
          ? <PredictionResult result={result} />
          : (
            <div className="flex flex-col items-center justify-center h-full min-h-64 rounded-xl border border-dashed border-border text-muted-foreground text-sm gap-2">
              <span className="text-3xl">🎯</span>
              <p>Fill in the form and click <strong>Predict Churn</strong></p>
              <p className="text-xs">Results and recommendations will appear here</p>
            </div>
          )
        }
      </div>
    </div>
  )
}
