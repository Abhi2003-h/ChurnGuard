import { BarChart2, Brain, Upload, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'dashboard' | 'predict' | 'batch'

interface LayoutProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  children: React.ReactNode
}

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={18} /> },
  { id: 'predict', label: 'Predict', icon: <Brain size={18} /> },
  { id: 'batch', label: 'Batch', icon: <Upload size={18} /> },
]

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-secondary border-r border-border flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <Activity size={20} className="text-primary" />
          <span className="font-semibold text-sm tracking-wide">ChurnGuard</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Telecom Churn ML v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 border-b border-border flex items-center px-6 shrink-0">
          <h1 className="text-base font-semibold">
            {navItems.find((n) => n.id === activeTab)?.label}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
