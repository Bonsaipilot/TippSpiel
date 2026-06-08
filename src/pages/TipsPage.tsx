import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import MatchCard from '../components/MatchCard'
import type { Match, Tip, Team } from '../types/database'

function ChampionCard({ userId, teams, firstKickoff }: { userId: string; teams: Team[]; firstKickoff: string | null }) {
  const [teamQuery, setTeamQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLocked = firstKickoff ? new Date(firstKickoff) <= new Date() : false

  useEffect(() => {
    supabase.from('profiles').select('champion_team_id').eq('id', userId).single()
      .then(({ data }) => { if (data?.champion_team_id) setSelectedId(data.champion_team_id) })
  }, [userId])

  const selectTeam = async (teamId: number) => {
    if (isLocked) return
    setSelectedId(teamId)
    setTeamQuery('')
    setSaving(true); setSaved(false)
    await supabase.from('profiles').update({ champion_team_id: teamId }).eq('id', userId)
    setSaving(false); setSaved(true)
  }

  const selectedTeam = teams.find(t => t.id === selectedId)
  const filtered = teamQuery
    ? teams.filter(t => t.name.toLowerCase().includes(teamQuery.toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-300 text-sm font-semibold">🏆 Weltmeister-Tipp</p>
        {isLocked && <span className="text-xs text-amber-500">Gesperrt</span>}
      </div>

      {selectedTeam && (
        <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
          <span className="text-2xl">{selectedTeam.flag}</span>
          <span className="text-white font-medium text-sm">{selectedTeam.name}</span>
          <span className="ml-auto text-xs">
            {saving ? <span className="text-slate-400">Speichere…</span>
              : saved ? <span className="text-green-400">✓ Gespeichert</span>
              : null}
          </span>
        </div>
      )}

      {!isLocked && (
        <div className="relative">
          <input
            type="text"
            value={teamQuery}
            onChange={e => setTeamQuery(e.target.value)}
            placeholder={selectedTeam ? 'Tipp ändern – Team suchen…' : 'Team suchen…'}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          {filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-slate-700 rounded-lg overflow-hidden shadow-xl border border-slate-600">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTeam(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-600 transition-colors ${
                    t.id === selectedId ? 'text-blue-300' : 'text-white'
                  }`}
                >
                  <span>{t.flag}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          )}
          {teamQuery && filtered.length === 0 && (
            <p className="text-slate-500 text-xs mt-1 px-1">Kein Team gefunden.</p>
          )}
        </div>
      )}

      {isLocked && !selectedTeam && (
        <p className="text-slate-500 text-xs">Kein Tipp abgegeben.</p>
      )}

      <p className="text-slate-600 text-xs">
        {isLocked
          ? 'Gesperrt seit Anpfiff des ersten Spiels.'
          : 'Richtig getippt: 5 Punkte · Wird nach dem Finale vergeben.'}
      </p>
    </div>
  )
}

export default function TipsPage() {
  const { user } = useAuth()
  const { query } = useSearch()
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Tip[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [firstKickoff, setFirstKickoff] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const homeRefMap = useRef<Record<number, React.RefObject<HTMLInputElement | null>>>({})
  const getHomeRef = (id: number): React.RefObject<HTMLInputElement | null> => {
    if (!homeRefMap.current[id]) homeRefMap.current[id] = React.createRef()
    return homeRefMap.current[id]
  }
  const sectionRefMap = useRef<Record<string, React.RefObject<HTMLElement | null>>>({})
  const getSectionRef = (key: string): React.RefObject<HTMLElement | null> => {
    if (!sectionRefMap.current[key]) sectionRefMap.current[key] = React.createRef()
    return sectionRefMap.current[key]
  }

  const scrollToInput = (el: HTMLElement) => {
    const navHeight = 72
    const targetFromTop = (window.innerHeight - navHeight) * 0.28
    const delta = el.getBoundingClientRect().top - targetFromTop
    document.querySelector('main')?.scrollBy({ top: delta, behavior: 'smooth' })
  }

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
      supabase
        .from('teams')
        .select('id,name,code,flag,group_id')
        .order('name'),
    ]).then(([matchRes, tipRes, teamRes]) => {
      if (matchRes.error) setError(matchRes.error.message)
      else {
        const allMatches = matchRes.data as Match[]
        setMatches(allMatches)
        const first = allMatches.reduce<string | null>((min, m) =>
          !min || m.kickoff < min ? m.kickoff : min, null)
        setFirstKickoff(first)
      }
      if (!tipRes.error) setTips(tipRes.data as Tip[])
      if (!teamRes.error) setTeams(teamRes.data as Team[])
      setLoading(false)
    })
  }, [user])

  // Geöffnete Gruppe nach oben scrollen + erstes Spiel fokussieren
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      // Gruppenheader an den Anfang des Scroll-Bereichs bringen
      const section = sectionRefMap.current[open]?.current
      if (section) {
        const main = document.querySelector('main')
        if (main) {
          const delta = section.getBoundingClientRect().top - main.getBoundingClientRect().top - 8
          main.scrollBy({ top: delta, behavior: 'smooth' })
        }
      }
      // Erstes Input fokussieren (ohne zusätzliches Scrollen)
      const first = matches.find(m => {
        const key = m.stage === 'group'
          ? `Gruppe ${m.group?.name ?? '?'}`
          : ({ r32: 'Runde der 32', r16: 'Achtelfinale', qf: 'Viertelfinale', sf: 'Halbfinale', final: 'Finale' } as Record<string, string>)[m.stage] ?? m.stage
        return key === open
      })
      if (!first) return
      const el = homeRefMap.current[first.id]?.current
      if (el) el.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(timer)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const SECTION_ORDER = [
    'Gruppe A','Gruppe B','Gruppe C','Gruppe D','Gruppe E','Gruppe F',
    'Gruppe G','Gruppe H','Gruppe I','Gruppe J','Gruppe K','Gruppe L',
    'Runde der 32','Achtelfinale','Viertelfinale','Halbfinale','Finale',
  ]

  const tipMap = Object.fromEntries(tips.map(t => [t.match_id, t]))
  const q = query.trim().toLowerCase()

  const toggle = (key: string) =>
    setOpen(prev => prev === key ? null : key)

  const matchesQuery = (m: Match) =>
    !q ||
    m.home_team?.name.toLowerCase().includes(q) ||
    m.away_team?.name.toLowerCase().includes(q)

  return (
    <div className="px-4 py-4 space-y-2">
      {Object.entries(grouped).sort(([a], [b]) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b)).map(([group, groupMatches]) => {
        const filtered = groupMatches.filter(matchesQuery)
        if (filtered.length === 0) return null
        const isOpen = q ? true : open === group
        const tipped = groupMatches.filter(m => tipMap[m.id]).length
        const allTipped = !q && tipped === groupMatches.length && groupMatches.length > 0
        return (
          <section key={group} ref={getSectionRef(group)}>
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
                {filtered.map((m, idx) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    tip={tipMap[m.id]}
                    userId={user!.id}
                    homeInputRef={getHomeRef(m.id)}
                    onAwayDone={idx < filtered.length - 1 ? () => {
                      const el = homeRefMap.current[filtered[idx + 1].id]?.current
                      if (el) { el.focus({ preventScroll: true }); scrollToInput(el) }
                    } : undefined}
                    onTipDeleted={id => setTips(prev => prev.filter(t => t.match_id !== id))}
                    onTipSaved={(matchId, home, away) => setTips(prev => {
                      const idx = prev.findIndex(t => t.match_id === matchId)
                      if (idx >= 0) {
                        const next = [...prev]
                        next[idx] = { ...next[idx], home_score: home, away_score: away }
                        return next
                      }
                      return [...prev, { match_id: matchId, home_score: home, away_score: away, user_id: user!.id } as Tip]
                    })}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {!q && teams.length > 0 && (
        <ChampionCard userId={user!.id} teams={teams} firstKickoff={firstKickoff} />
      )}
    </div>
  )
}
