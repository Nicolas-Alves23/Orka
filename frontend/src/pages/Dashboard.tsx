import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface HistoryItem {
  id: string
  createdAt: string
  monthlyIncome: string
  budgetDivision: {
    investimento: { valor: number; percentual: number }
    reserva: { valor: number; percentual: number }
  }
  aiSummary: string
}

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const CHART_COLORS = {
  light: { investimento: '#8b5cf6', reserva: '#6366f1' },
  dark: { investimento: '#a78bfa', reserva: '#22d3ee' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .get('/finance/history', { params: { limit: 5 } })
      .then(({ data }) => {
        setHistory(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => {})
    api.get('/finance/profile').then(() => setHasProfile(true)).catch(() => setHasProfile(false))
  }, [])

  const colors = CHART_COLORS[theme]
  const chartData = history.slice(0, 6).reverse().map((item, i) => ({
    name: `#${i + 1}`,
    renda: Number(item.monthlyIncome),
    investimento: item.budgetDivision.investimento.valor,
    reserva: item.budgetDivision.reserva.valor,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {total > 0
            ? `Você tem ${total} recomendação${total > 1 ? 'ões' : ''} gerada${total > 1 ? 's' : ''}`
            : 'Comece configurando seu perfil financeiro'}
        </p>
      </div>

      {hasProfile === false && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Configure seu perfil</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informe sua renda e objetivos para receber recomendações</p>
          </div>
          <Link
            to="/perfil"
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            Configurar
          </Link>
        </div>
      )}

      {history.length > 0 && (
        <>
          {/* Last recommendation summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Última recomendação</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{history[0].aiSummary}</p>
            <Link to="/recomendacao" className="text-xs text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200 mt-2 inline-block">
              Ver nova análise →
            </Link>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Histórico de investimento × reserva</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  formatter={(value) => [fmt(Number(value))]}
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }
                      : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }
                  }
                  labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a', fontSize: 12 }}
                />
                <Bar dataKey="investimento" name="Investimento" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={colors.investimento} />)}
                </Bar>
                <Bar dataKey="reserva" name="Reserva" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={colors.reserva} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent history preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Histórico recente</h3>
              <Link to="/historico" className="text-xs text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200">
                Ver histórico completo →
              </Link>
            </div>
            {history.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{item.aiSummary.slice(0, 80)}...</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')} · Renda: {fmt(Number(item.monthlyIncome))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {history.length === 0 && hasProfile && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Nenhuma recomendação ainda</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Vá para a aba IA e gere sua primeira análise</p>
          <Link to="/recomendacao" className="inline-block mt-4 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Gerar agora
          </Link>
        </div>
      )}
    </div>
  )
}
