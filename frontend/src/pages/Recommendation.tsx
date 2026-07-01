import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'

interface BudgetSlice {
  valor: number
  percentual: number
  descricao: string
}

interface BudgetDivision {
  essencial: BudgetSlice
  investimento: BudgetSlice
  lazer: BudgetSlice
  reserva: BudgetSlice
}

interface InvestmentOption {
  tipo: string
  nome: string
  descricao: string
  risco: 'baixo' | 'médio' | 'alto'
  retornoEstimado: string
  link: string
  dadosAoVivo?: { regularMarketPrice: number; regularMarketChangePercent: number } | null
}

interface Recommendation {
  budgetDivision: BudgetDivision
  recommendations: InvestmentOption[]
  aiSummary: string
}

const BUDGET_COLORS = {
  light: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  dark: ['#818cf8', '#a78bfa', '#c4b5fd', '#22d3ee'],
}
const RISK_BADGE: Record<string, string> = {
  baixo: 'bg-emerald-500/20 text-emerald-400',
  médio: 'bg-amber-500/20 text-amber-400',
  alto: 'bg-red-500/20 text-red-400',
}

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Recommendation() {
  const { theme } = useTheme()
  const [data, setData] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const budgetColors = BUDGET_COLORS[theme]

  async function generate() {
    setError('')
    setLoading(true)
    try {
      const { data: res } = await api.post('/ai/recommend')
      setData(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao gerar recomendação')
    } finally {
      setLoading(false)
    }
  }

  const pieData = data
    ? [
        { name: 'Essencial', value: data.budgetDivision.essencial.percentual },
        { name: 'Investimento', value: data.budgetDivision.investimento.percentual },
        { name: 'Lazer', value: data.budgetDivision.lazer.percentual },
        { name: 'Reserva', value: data.budgetDivision.reserva.percentual },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recomendação com IA</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Análise personalizada do seu perfil financeiro</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors dark:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar recomendação'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!data && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Pronto para analisar seu perfil</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Clique em "Gerar recomendação" para receber uma análise personalizada do Claude
          </p>
        </div>
      )}

      {data && (
        <>
          {/* AI Summary */}
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5">
            <p className="text-xs text-violet-600 dark:text-violet-300 font-medium mb-2">Análise do Claude</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{data.aiSummary}</p>
          </div>

          {/* Budget Division */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Divisão do orçamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={budgetColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`]}
                    contentStyle={
                      theme === 'dark'
                        ? { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }
                        : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }
                    }
                    labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-slate-600 dark:text-slate-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {Object.entries(data.budgetDivision).map(([key, slice], i) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: budgetColors[i] }}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{key}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{fmt(slice.valor)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-500 ml-1.5">{slice.percentual}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Investimentos sugeridos</h3>
            {data.recommendations.map((inv) => (
              <div
                key={inv.tipo}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{inv.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BADGE[inv.risco]}`}>
                      {inv.risco}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{inv.descricao}</p>
                  <p className="text-xs text-violet-600 dark:text-violet-300">Retorno estimado: {inv.retornoEstimado}</p>
                  {inv.dadosAoVivo && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Preço atual: {fmt(inv.dadosAoVivo.regularMarketPrice)}
                      <span
                        className={`ml-2 ${inv.dadosAoVivo.regularMarketChangePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {inv.dadosAoVivo.regularMarketChangePercent >= 0 ? '+' : ''}
                        {inv.dadosAoVivo.regularMarketChangePercent.toFixed(2)}%
                      </span>
                    </p>
                  )}
                </div>
                <a
                  href={inv.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg px-3 py-1.5 transition-colors shrink-0"
                >
                  Ver →
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
