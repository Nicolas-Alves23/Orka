import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const RISK_OPTIONS = [
  { value: 'conservador', label: 'Conservador', desc: 'Prefiro segurança, mesmo com retorno menor' },
  { value: 'moderado', label: 'Moderado', desc: 'Equilíbrio entre segurança e rentabilidade' },
  { value: 'arrojado', label: 'Arrojado', desc: 'Aceito mais risco em busca de maior retorno' },
] as const

const GOAL_OPTIONS = [
  { value: 'reserva_emergencia', label: 'Reserva de emergência' },
  { value: 'aposentadoria', label: 'Aposentadoria' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'outro', label: 'Outro' },
] as const

export default function Profile() {
  const navigate = useNavigate()
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [riskProfile, setRiskProfile] = useState<'conservador' | 'moderado' | 'arrojado'>('moderado')
  const [mainGoal, setMainGoal] = useState<string>('reserva_emergencia')
  const [hasEmergencyFund, setHasEmergencyFund] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/finance/profile').then(({ data }) => {
      const p = data.data
      setMonthlyIncome(p.monthlyIncome)
      setMonthlyExpenses(p.monthlyExpenses || '')
      setRiskProfile(p.riskProfile || 'moderado')
      setMainGoal(p.mainGoal || 'reserva_emergencia')
      setHasEmergencyFund(p.hasEmergencyFund || false)
    }).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/finance/profile', {
        monthlyIncome: Number(monthlyIncome),
        monthlyExpenses: monthlyExpenses ? Number(monthlyExpenses) : undefined,
        riskProfile,
        mainGoal,
        hasEmergencyFund,
      })
      setSuccess(true)
      setTimeout(() => navigate('/recomendacao'), 1200)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Perfil financeiro</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Essas informações personalizam suas recomendações</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Renda e gastos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Renda mensal (R$)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Gastos mensais (R$)</label>
              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Perfil de risco</h3>
          {RISK_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                riskProfile === opt.value
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="risk"
                value={opt.value}
                checked={riskProfile === opt.value}
                onChange={() => setRiskProfile(opt.value)}
                className="mt-0.5 accent-violet-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Objetivo principal</h3>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                  mainGoal === opt.value
                    ? 'border-violet-500 bg-violet-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  value={opt.value}
                  checked={mainGoal === opt.value}
                  onChange={() => setMainGoal(opt.value)}
                  className="accent-violet-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasEmergencyFund}
            onChange={(e) => setHasEmergencyFund(e.target.checked)}
            className="w-4 h-4 accent-violet-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">Já tenho reserva de emergência</span>
        </label>

        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-sm">Perfil salvo! Redirecionando...</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors dark:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
        >
          {loading ? 'Salvando...' : 'Salvar e ver recomendações'}
        </button>
      </form>
    </div>
  )
}
