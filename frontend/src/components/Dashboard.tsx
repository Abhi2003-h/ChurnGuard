import { useEffect, useState, useRef } from 'react'
import { ShieldCheck, TrendingDown, Zap, Users, BarChart2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModelStats } from '@/types'

interface DashboardProps {
  stats: ModelStats | null
  loading: boolean
}

const METRIC_CARDS = [
  { label: 'Accuracy',  key: 'accuracy'  as const, color: 'text-blue-600',   desc: 'Overall correct predictions' },
  { label: 'Recall',    key: 'recall'    as const, color: 'text-green-600',  desc: 'Churners correctly caught' },
  { label: 'Precision', key: 'precision' as const, color: 'text-amber-600',  desc: 'Flagged customers who truly churn' },
  { label: 'F1 Score',  key: 'f1'        as const, color: 'text-purple-600', desc: 'Balance of precision & recall' },
]

const WHY_ITEMS = [
  {
    icon: <BarChart2 size={22} className="text-blue-600" />,
    title: 'Analyze Usage & Billing Data',
    body: 'Analyze customer usage, billing, and demographic data to surface the signals that matter most.',
  },
  {
    icon: <Zap size={22} className="text-amber-600" />,
    title: 'AI-Based Churn Prediction',
    body: 'Build and deploy an AI-based model that learns complex patterns across thousands of customer records.',
  },
  {
    icon: <TrendingDown size={22} className="text-red-600" />,
    title: 'Identify High-Risk Customers',
    body: 'Pinpoint customers at high risk of leaving before they disengage, giving retention teams time to act.',
  },
  {
    icon: <ShieldCheck size={22} className="text-green-600" />,
    title: 'Churn Risk Scores & Insights',
    body: 'Generate clear churn risk scores and actionable insights — not just a black-box probability.',
  },
  {
    icon: <Users size={22} className="text-indigo-600" />,
    title: 'Proactive Retention Strategies',
    body: 'Enable proactive retention strategies such as personalised offers, discounts, and check-in calls.',
  },
  {
    icon: <Clock size={22} className="text-purple-600" />,
    title: 'Reduce False Positives',
    body: 'Improve prediction accuracy and reduce false positives so your team focuses effort where it counts.',
  },
  {
    icon: <TrendingDown size={22} className="text-orange-600" />,
    title: 'Data-Driven Decisions',
    body: 'Support data-driven decision making in telecom services with live model metrics and explainable results.',
  },
]

const TYPING_LINES = [
  'Identifies customers at risk of churning before disengagement.',
  'Generates churn risk scores and actionable insights.',
  'Enables proactive retention strategies — personalised for each customer.',
]

function useTypingLines(lines: string[], charDelay = 38, lineDelay = 500) {
  const [displayed, setDisplayed] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (currentLine >= lines.length) return

    const tick = (now: number) => {
      const elapsed = now - lastTimeRef.current
      const delay = currentChar === 0 && currentLine > 0 ? lineDelay : charDelay

      if (elapsed >= delay) {
        lastTimeRef.current = now
        const line = lines[currentLine]

        if (currentChar < line.length) {
          setDisplayed((prev) => {
            const next = [...prev]
            next[currentLine] = (next[currentLine] ?? '') + line[currentChar]
            return next
          })
          setCurrentChar((c) => c + 1)
        } else {
          setCurrentLine((l) => l + 1)
          setCurrentChar(0)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [currentLine, currentChar, lines, charDelay, lineDelay])

  return displayed
}

export function Dashboard({ stats, loading }: DashboardProps) {
  const typedLines = useTypingLines(TYPING_LINES)

  return (
    <div className="space-y-16 pb-10 flex flex-col items-center">

      {/* ── Hero ── */}
      <section className="pt-10 space-y-6 max-w-2xl w-full text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            ChurnGuard
          </h1>
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            AI-Powered Customer Risk Predictor
          </p>
        </div>

        <p className="text-muted-foreground text-base leading-relaxed">
          ChurnGuard is an AI-powered customer churn prediction system. It identifies customers
          at risk of churning before disengagement. Machine learning models analyze customer
          identifiers and usage patterns. Billing details and demographic data are used for
          accurate prediction. The system generates churn risk scores and actionable insights.
          Enables proactive retention strategies such as personalised offers and discounts.
          Helps improve customer loyalty and reduce churn.
        </p>

        {/* Typing lines */}
        <div className="space-y-1.5 min-h-[5.5rem]">
          {TYPING_LINES.map((line, i) => (
            <p
              key={i}
              className={`text-sm font-medium transition-opacity duration-500 ${
                i === 0 ? 'text-blue-600' : i === 1 ? 'text-green-600' : 'text-purple-600'
              } ${typedLines[i] !== undefined ? 'opacity-100' : 'opacity-0'}`}
            >
              {typedLines[i] ?? ''}
              {typedLines[i] !== undefined && typedLines[i].length < line.length && (
                <span className="animate-pulse">▍</span>
              )}
            </p>
          ))}
        </div>
      </section>

      {/* ── Why ChurnGuard? ── */}
      <section className="space-y-6 w-full max-w-5xl">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold">Why ChurnGuard?</h2>
          <p className="text-muted-foreground text-sm">
            Everything your retention team needs, powered by a high-accuracy ML model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WHY_ITEMS.map(({ icon, title, body }) => (
            <Card key={title} className="hover:border-muted-foreground/40 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  {icon}
                  <p className="font-semibold text-sm">{title}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Model Performance ── */}
      <section className="space-y-4 w-full max-w-5xl">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold">Model Performance</h2>
          <p className="text-muted-foreground text-sm">
            Evaluated on a held-out 20% test set of real telecom customers.
          </p>
        </div>

        {loading && (
          <p className="text-muted-foreground text-sm text-center">Loading metrics…</p>
        )}

        {!loading && !stats && (
          <p className="text-destructive text-sm text-center">
            Could not load model stats — make sure the backend is running.
          </p>
        )}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_CARDS.map(({ label, key, color, desc }) => (
              <Card key={key}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className={`text-3xl font-bold ${color}`}>
                    {(stats[key] * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
