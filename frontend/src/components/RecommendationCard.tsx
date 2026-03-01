import { AlertTriangle, CheckCircle2, PhoneCall, Globe, DollarSign, Voicemail, UserCheck, Headphones } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecommendationCardProps {
  recommendations: string[]
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'dedicated account manager': <UserCheck size={16} />,
  'international': <Globe size={16} />,
  'loyalty discount': <DollarSign size={16} />,
  'unlimited international': <Globe size={16} />,
  'priority international': <Globe size={16} />,
  'voicemail': <Voicemail size={16} />,
  'check-in call': <PhoneCall size={16} />,
  'retention specialist': <Headphones size={16} />,
}

function getIcon(rec: string): React.ReactNode {
  const lower = rec.toLowerCase()
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon
  }
  return <AlertTriangle size={16} />
}

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="text-green-600" size={20} />
          <p className="text-sm text-muted-foreground">
            No immediate retention actions required.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-600" />
          Retention Recommendations
          <Badge variant="secondary">{recommendations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                {getIcon(rec)}
              </span>
              <span className="text-muted-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
