import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import MatchCard from '../components/MatchCard'
import type { Match, Tip } from '../types/database'

export default function TipsPage() {
  const { user } = useAuth()
  const { query } = useSearch()
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('matches')
        .select('*, home_team:home_team_id(id,name,code,flag), away_team:away_team_id(id,name,code,flag), group:group_id(id,name)')
        .order('kickoff'),
      supabase
        .from('tips')
        .select('*')
        .eq('user_id', user.id),
    ]).then(([matchRes, tipRes]) => {
      if (matchRes.error) setError(matchRes.error.message)
      else setMatches(matchRes.data as Match[])
      if (!tipRes.error) setTips(tipRes.data as Tip[])
      setLoading(false)
    })
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Lade Spiele…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-red-400">
        Fehler: {error}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="px-4 py-12 text-center space-y-2">
        <p className="text-4xl">📅</p>
        <p className="text-slate-400 font-medium">Noch keine Spiele eingetragen</p>
        <p className="text-slate-600 text-sm">Führe die seed.sql im Supabase SQL Editor aus.</p>
      </div>
    )
  }

  // KO-Runden nur anzeigen, wenn beide Teams vom Admin befüllt wurden
  const visibleMatches = matches.filter(m =>
    m.stage === 'group' || (m.home_team_id !== null && m.away_team_id !== null)
  )

  // Nach Gruppe / Stage gruppieren
  const grouped = visibleMatches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.stage === 'group'
      ? `Gruppe ${m.group?.name ?? '?'}`
      : { r32: 'Runde der 32', r16: 'Achtelfinale', qf: 'Viertelfinale', sf: 'Halbfinale', final: 'Finale' }[m.stage] ?? m.stage
    ;(acc[key] ??= []).push(m)
    return acc
  }, {})

  const tipMap = Object.fromEntries(tips.map(t => [t.match_id, t]))
  const q = query.trim().toLowerCase()

  const toggle = (key: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const matchesQuery = (m: Match) =>
    !q ||
    m.home_team?.name.toLowerCase().includes(q) ||
    m.away_team?.name.toLowerCase().includes(q)

  return (
    <div className="px-4 py-4 space-y-2">
      {Object.entries(grouped).map(([group, groupMatches]) => {
        const filtered = groupMatches.filter(matchesQuery)
        if (filtered.length === 0) return null
        const isOpen = q ? true : open.has(group)
        const tipped = groupMatches.filter(m => tipMap[m.id]).length
        const allTipped = !q && tipped === groupMatches.length && groupMatches.length > 0
        return (
          <section key={group}>
            <button
              onClick={() => { if (!q) toggle(group) }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                allTipped ? 'bg-green-900/40 border border-green-700/50' : 'bg-slate-800'
              }`}
            >
              <span className="text-slate-300 text-sm font-semibold">{group}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">{tipped}/{groupMatches.length} getippt</span>
                {!q && <span className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>}
              </div>
            </button>
            {isOpen && (
              <div className="space-y-3 mt-2">
                {filtered.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    tip={tipMap[m.id]}
                    userId={user!.id}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
