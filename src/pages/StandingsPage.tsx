import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Standing {
  rank: number
  team_id: number
  team_name: string
  team_flag: string
  team_code: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_diff: number
  points: number
}

interface ThirdPlaced {
  rank: number
  team_id: number
  team_name: string
  team_flag: string
  group_name: string
  points: number
  goal_diff: number
  goals_for: number
}

interface Group {
  id: number
  name: string
}

const GROUP_NAMES = ['A','B','C','D','E','F','G','H','I','J','K','L']

function rowColor(rank: number) {
  if (rank <= 2) return 'border-l-2 border-green-500'
  if (rank === 3) return 'border-l-2 border-yellow-500'
  return 'border-l-2 border-transparent'
}

function rankBadge(rank: number) {
  if (rank === 1) return <span className="text-green-400 font-bold">{rank}</span>
  if (rank === 2) return <span className="text-green-500 font-bold">{rank}</span>
  if (rank === 3) return <span className="text-yellow-500">{rank}</span>
  return <span className="text-slate-500">{rank}</span>
}

export default function StandingsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [activeTab, setActiveTab] = useState<string>('A')
  const [standings, setStandings] = useState<Standing[]>([])
  const [thirds, setThirds] = useState<ThirdPlaced[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('groups').select('*').order('name')
      .then(({ data }) => { if (data) setGroups(data as Group[]) })
  }, [])

  useEffect(() => {
    if (activeTab === '3.') {
      setLoading(true)
      supabase.rpc('get_best_third_placed')
        .then(({ data }) => {
          setThirds((data ?? []) as ThirdPlaced[])
          setLoading(false)
        })
      return
    }

    const group = groups.find(g => g.name === activeTab)
    if (!group) return
    setLoading(true)
    supabase.rpc('get_group_standings', { p_group_id: group.id })
      .then(({ data }) => {
        setStandings((data ?? []) as Standing[])
        setLoading(false)
      })
  }, [activeTab, groups])

  const tabs = [...GROUP_NAMES, '3.']

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Gruppen-Tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab === '3.' ? '3. Plätze' : `Gr. ${tab}`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-8">Lade…</p>
      ) : activeTab === '3.' ? (
        /* Beste Drittplatzierte */
        <div className="space-y-1">
          <p className="text-slate-500 text-xs mb-3">
            Die 8 besten Drittplatzierten qualifizieren sich für die Runde der 32.
          </p>
          {thirds.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Noch keine abgeschlossenen Gruppenspiele.</p>
          ) : (
            thirds.map(t => (
              <div key={t.team_id}
                className={`flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 ${
                  t.rank <= 8 ? 'border-l-2 border-green-500' : 'border-l-2 border-transparent'
                }`}>
                <span className="w-5 text-center text-slate-500 text-sm font-bold shrink-0">{t.rank}</span>
                <span className="text-xl shrink-0">{t.team_flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.team_name}</p>
                  <p className="text-slate-500 text-xs">Gruppe {t.group_name}</p>
                </div>
                <div className="flex gap-3 text-sm shrink-0">
                  <span className="text-slate-400">{t.points} Pkt</span>
                  <span className="text-slate-500">{t.goal_diff > 0 ? '+' : ''}{t.goal_diff}</span>
                  <span className="text-slate-500">{t.goals_for} Tore</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Gruppentabelle */
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_2rem_3.5rem_2.5rem_2rem] gap-x-2 px-3 py-2 text-slate-500 text-xs border-b border-slate-700">
            <span>#</span>
            <span>Team</span>
            <span className="text-center">Sp</span>
            <span className="text-center">S</span>
            <span className="text-center">U</span>
            <span className="text-center">N</span>
            <span className="text-center">Tore</span>
            <span className="text-center">TD</span>
            <span className="text-center font-semibold">Pkt</span>
          </div>

          {standings.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Noch keine abgeschlossenen Spiele.</p>
          ) : (
            standings.map((s, i) => (
              <div
                key={s.team_id}
                className={`grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_2rem_3.5rem_2.5rem_2rem] gap-x-2 px-3 py-2.5 items-center ${rowColor(s.rank)} ${
                  i < standings.length - 1 ? 'border-b border-slate-700/50' : ''
                }`}
              >
                <span className="text-sm">{rankBadge(s.rank)}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base shrink-0">{s.team_flag}</span>
                  <span className="text-white text-sm truncate">{s.team_name}</span>
                </div>
                <span className="text-center text-slate-400 text-xs">{s.played}</span>
                <span className="text-center text-slate-400 text-xs">{s.won}</span>
                <span className="text-center text-slate-400 text-xs">{s.drawn}</span>
                <span className="text-center text-slate-400 text-xs">{s.lost}</span>
                <span className="text-center text-slate-400 text-xs">{s.goals_for}:{s.goals_against}</span>
                <span className={`text-center text-xs font-medium ${s.goal_diff > 0 ? 'text-green-400' : s.goal_diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {s.goal_diff > 0 ? '+' : ''}{s.goal_diff}
                </span>
                <span className="text-center text-white text-sm font-bold">{s.points}</span>
              </div>
            ))
          )}

          {/* Legende */}
          <div className="px-3 py-2 border-t border-slate-700 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Weiterkommen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> Evtl. als 3.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
