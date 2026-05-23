import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match, Team } from '../types/database'

// ─── Typen ───────────────────────────────────────────────────
interface BracketRule {
  match_id: number
  home_label: string
  away_label: string
}

// ─── Hilfsfunktionen ─────────────────────────────────────────
function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatLabel(label: string) {
  if (/^1[A-L]$/.test(label)) return `Sieger Gr. ${label[1]}`
  if (/^2[A-L]$/.test(label)) return `2. Gr. ${label[1]}`
  if (/^3-[1-8]$/.test(label)) return `${label.split('-')[1]}. bester Dritter`
  return label
}

// ─── Einladungslink ───────────────────────────────────────────
function InviteSection() {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = () =>
    supabase.from('settings').select('value').eq('key', 'invite_code').single()
      .then(({ data }) => { if (data) setCode(data.value) })

  useEffect(() => { load() }, [])

  const inviteUrl = code ? `${window.location.origin}/login?code=${code}` : ''

  const copy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerate = async () => {
    const newCode = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('')
    await supabase.from('settings').update({ value: newCode }).eq('key', 'invite_code')
    setCode(newCode)
  }

  if (!code) return null
  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Einladungslink</p>
      <div className="bg-slate-700 rounded-lg px-3 py-2">
        <p className="text-slate-500 text-xs mb-0.5">Code</p>
        <p className="text-white font-mono font-bold tracking-widest text-lg">{code}</p>
      </div>
      <div className="bg-slate-700 rounded-lg px-3 py-2">
        <p className="text-slate-500 text-xs mb-0.5">Link</p>
        <p className="text-blue-400 text-xs break-all">{inviteUrl}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={copy}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-lg transition-colors">
          {copied ? '✓ Kopiert!' : '📋 Link kopieren'}
        </button>
        <button onClick={regenerate}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium py-2 rounded-lg transition-colors">
          🔄 Neu generieren
        </button>
      </div>
    </div>
  )
}

// ─── Auto-Fill (generisch für alle K.O.-Runden) ───────────────
function AutoFillSection({ label, desc, rpc, ready, onDone }: {
  label: string
  desc: string
  rpc: string
  ready: boolean
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const fill = async () => {
    setLoading(true)
    setMsg(null)
    const { data, error } = await supabase.rpc(rpc)
    if (error) setMsg('Fehler: ' + error.message)
    else { setMsg(String(data)); onDone() }
    setLoading(false)
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
      {!ready && (
        <p className="text-xs text-amber-600">Noch nicht alle Vorrundenspiele abgeschlossen.</p>
      )}
      {msg && (
        <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.startsWith('Fehler') ? 'text-red-400 bg-red-950/40' : 'text-green-400 bg-green-950/40'}`}>
          {msg}
        </p>
      )}
      <button onClick={fill} disabled={loading || !ready}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors">
        {loading ? 'Berechne…' : `⚡ ${label} automatisch befüllen`}
      </button>
    </div>
  )
}

const KO_ROUNDS = [
  { label: 'Runde der 32',  desc: 'Befüllt die Paarungen aus den Gruppenspiel-Ergebnissen.', rpc: 'fill_r32_teams', prereq: 'group' },
  { label: 'Achtelfinale',  desc: 'Befüllt die Paarungen aus den R32-Ergebnissen.',          rpc: 'fill_r16_teams', prereq: 'r32'   },
  { label: 'Viertelfinale', desc: 'Befüllt die Paarungen aus den Achtelfinale-Ergebnissen.', rpc: 'fill_qf_teams',  prereq: 'r16'   },
  { label: 'Halbfinale',    desc: 'Befüllt die Paarungen aus den Viertelfinale-Ergebnissen.',rpc: 'fill_sf_teams',  prereq: 'qf'    },
  { label: 'Finale',        desc: 'Befüllt die Paarungen aus den Halbfinale-Ergebnissen.',   rpc: 'fill_final_teams', prereq: 'sf'  },
]

// ─── Team-Dropdown ────────────────────────────────────────────
function TeamSelect({
  value, onChange, teams, placeholder,
}: {
  value: number | null
  onChange: (id: number | null) => void
  teams: Team[]
  placeholder: string
}) {
  const byGroup = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const g = t.group?.name ?? '?'
    ;(acc[g] ??= []).push(t)
    return acc
  }, {})

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}
      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
    >
      <option value="">{placeholder}</option>
      {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([group, ts]) => (
        <optgroup key={group} label={`Gruppe ${group}`}>
          {ts.map(t => (
            <option key={t.id} value={t.id}>
              {t.flag} {t.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ─── Match-Karte ──────────────────────────────────────────────
interface MatchRowProps {
  match: Match
  onSaved: () => void
  teams: Team[]
  bracketRule?: BracketRule
}

function MatchRow({ match, onSaved, teams, bracketRule }: MatchRowProps) {
  const hasTeams = match.home_team_id !== null && match.away_team_id !== null

  // Ergebnis-State
  const [home, setHome] = useState(match.home_score?.toString() ?? '')
  const [away, setAway] = useState(match.away_score?.toString() ?? '')
  const awayRef = useRef<HTMLInputElement>(null)

  // Team-Auswahl-State (für K.O.-Spiele ohne Teams)
  const [homeTeamId, setHomeTeamId] = useState<number | null>(match.home_team_id)
  const [awayTeamId, setAwayTeamId] = useState<number | null>(match.away_team_id)
  const [editTeams, setEditTeams] = useState(!hasTeams)

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setHome(v)
    if (v.length === 1) awayRef.current?.focus()
  }

  const resetMatch = async () => {
    setSaving(true); setMsg(null)
    const { data, error } = await supabase.rpc('reset_match', { p_match_id: match.id })
    if (error) setMsg('Fehler: ' + error.message)
    else { setMsg(String(data)); setHome(''); setAway(''); onSaved() }
    setSaving(false)
  }

  const saveTeams = async () => {
    if (!homeTeamId || !awayTeamId) { setMsg('Bitte beide Teams auswählen.'); return }
    setSaving(true); setMsg(null)
    const { error } = await supabase.from('matches')
      .update({ home_team_id: homeTeamId, away_team_id: awayTeamId })
      .eq('id', match.id)
    setSaving(false)
    if (error) setMsg('Fehler: ' + error.message)
    else { setMsg('✓ Teams gespeichert'); setEditTeams(false); onSaved() }
  }

  const saveScore = async (finish: boolean) => {
    const h = parseInt(home), a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setMsg('Ungültige Eingabe'); return }
    setSaving(true); setMsg(null)
    const { error } = await supabase.from('matches')
      .update({ home_score: h, away_score: a, is_finished: finish })
      .eq('id', match.id)
    if (error) { setMsg('Fehler: ' + error.message); setSaving(false); return }
    if (finish) {
      const { data, error: rpcErr } = await supabase.rpc('calculate_match_points', { p_match_id: match.id })
      setMsg(rpcErr ? 'Ergebnis gespeichert, Punkte-Fehler: ' + rpcErr.message : `✓ Abgeschlossen · ${data} Tipps bewertet`)
    } else {
      setMsg('✓ Zwischenstand gespeichert')
    }
    setSaving(false); onSaved()
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      {/* Bracket-Label für K.O.-Spiele */}
      {bracketRule && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{formatLabel(bracketRule.home_label)}</span>
          <span className="text-slate-600">vs</span>
          <span>{formatLabel(bracketRule.away_label)}</span>
        </div>
      )}

      {editTeams ? (
        /* Team-Auswahl */
        <div className="space-y-2">
          <TeamSelect value={homeTeamId} onChange={setHomeTeamId} teams={teams} placeholder="Heimteam wählen…" />
          <TeamSelect value={awayTeamId} onChange={setAwayTeamId} teams={teams} placeholder="Auswärtsteam wählen…" />
          <div className="flex gap-2 pt-1">
            {hasTeams && (
              <button onClick={() => setEditTeams(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs py-2 rounded-lg transition-colors">
                Abbrechen
              </button>
            )}
            <button onClick={saveTeams} disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg transition-colors">
              {saving ? 'Speichere…' : 'Teams festlegen'}
            </button>
          </div>
        </div>
      ) : (
        /* Ergebnis-Eingabe */
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {match.home_team?.flag} {match.home_team?.name}
                <span className="text-slate-500 mx-2">vs</span>
                {match.away_team?.name} {match.away_team?.flag}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{formatKickoff(match.kickoff)}</p>
              {match.venue && <p className="text-slate-600 text-xs">{match.venue}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <input type="number" min={0} max={99} value={home} onChange={handleHomeChange}
                className="w-10 text-center bg-slate-700 text-white rounded-lg py-1.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500" />
              <span className="text-slate-500 font-bold">:</span>
              <input ref={awayRef} type="number" min={0} max={99} value={away} onChange={e => setAway(e.target.value)}
                className="w-10 text-center bg-slate-700 text-white rounded-lg py-1.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          {match.is_finished && (
            <p className="text-xs text-amber-500/80 bg-amber-950/30 px-3 py-1.5 rounded-lg">
              Bereits abgeschlossen — Ergebnis korrigieren und neu speichern, oder zurücksetzen.
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setEditTeams(true)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs px-3 py-2 rounded-lg transition-colors shrink-0">
              ✏️
            </button>
            {!match.is_finished && (
              <button onClick={() => saveScore(false)} disabled={saving}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-xs font-medium py-2 rounded-lg transition-colors">
                Zwischenstand
              </button>
            )}
            <button onClick={() => saveScore(true)} disabled={saving}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg transition-colors">
              {saving ? 'Speichere…' : match.is_finished ? 'Korrigieren + Punkte neu' : 'Abpfiff + Punkte'}
            </button>
          </div>
          {match.is_finished && (
            <button onClick={resetMatch} disabled={saving}
              className="w-full bg-red-900/40 hover:bg-red-900/70 disabled:opacity-50 text-red-400 text-xs font-medium py-1.5 rounded-lg transition-colors">
              ↩ Komplett zurücksetzen
            </button>
          )}
        </div>
      )}

      {msg && (
        <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.startsWith('✓') ? 'text-green-400 bg-green-950/40' : 'text-red-400 bg-red-950/40'}`}>
          {msg}
        </p>
      )}
    </div>
  )
}

// ─── Hauptseite ───────────────────────────────────────────────
type Tab = 'offen' | 'beendet'

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [bracketRules, setBracketRules] = useState<BracketRule[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('offen')

  const load = () => {
    setLoading(true)
    Promise.all([
      supabase
        .from('matches')
        .select('*, home_team:home_team_id(id,name,code,flag), away_team:away_team_id(id,name,code,flag)')
        .order('kickoff'),
      supabase
        .from('teams')
        .select('*, group:group_id(id,name)')
        .order('group_id'),
      supabase
        .from('bracket_rules')
        .select('match_id, home_label, away_label'),
    ]).then(([mRes, tRes, bRes]) => {
      if (mRes.data) setMatches(mRes.data as Match[])
      if (tRes.data) setTeams(tRes.data as Team[])
      if (bRes.data) setBracketRules(bRes.data as BracketRule[])
      setLoading(false)
    })
  }

  useEffect(load, [])

  const bracketMap = Object.fromEntries(bracketRules.map(r => [r.match_id, r]))
  const visible = matches.filter(m => tab === 'offen' ? !m.is_finished : m.is_finished)

  return (
    <div className="px-4 py-4 space-y-4">
      <InviteSection />
      {KO_ROUNDS.map(r => {
        const prereqMatches = matches.filter(m => m.stage === r.prereq)
        const ready = prereqMatches.length > 0 && prereqMatches.every(m => m.is_finished)
        return <AutoFillSection key={r.rpc} label={r.label} desc={r.desc} rpc={r.rpc} ready={ready} onDone={load} />
      })}

      <div className="flex rounded-lg bg-slate-700 p-1">
        {(['offen', 'beendet'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
            }`}>
            {t === 'offen'
              ? `Offen (${matches.filter(m => !m.is_finished).length})`
              : `Beendet (${matches.filter(m => m.is_finished).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-8">Lade…</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Keine Spiele in dieser Kategorie.</p>
      ) : (
        <div className="space-y-3">
          {visible.map(m => (
            <MatchRow
              key={m.id}
              match={m}
              onSaved={load}
              teams={teams}
              bracketRule={bracketMap[m.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
