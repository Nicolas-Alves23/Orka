import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

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

const LIMIT = 10

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get('/finance/history', { params: { page, limit: LIMIT } })
      .then(({ data }) => {
        setItems(data.data)
        setTotalPages(data.meta.totalPages)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-xs text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200">
          ← Voltar ao dashboard
        </Link>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-2">Histórico completo</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Todas as recomendações já geradas</p>
      </div>

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>}

      {!loading && items.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-12 text-center">
          <p className="text-slate-600 dark:text-slate-300 font-medium">Nenhuma recomendação encontrada</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.aiSummary}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')} · Renda: {fmt(Number(item.monthlyIncome))} · Investimento: {fmt(item.budgetDivision.investimento.valor)} · Reserva: {fmt(item.budgetDivision.reserva.valor)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
