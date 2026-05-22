import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4'
const WC_START = new Date('2026-06-11')
const WC_END   = new Date('2026-07-20')

// Unsere DB-Codes → football-data.org tla (wo sie abweichen)
const CODE_MAP: Record<string, string> = {
  TTO: 'TRI',  // Trinidad & Tobago
}

function toApiCode(dbCode: string): string {
  return CODE_MAP[dbCode] ?? dbCode
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  // Vercel sendet den CRON_SECRET automatisch im Authorization-Header
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Außerhalb des WM-Zeitraums nichts tun
  const now = new Date()
  if (now < WC_START || now > WC_END) {
    return res.status(200).json({ message: 'Außerhalb WM-Zeitraum – übersprungen' })
  }

  try {
    // 1. Abgeschlossene WM-Spiele von football-data.org laden
    const apiRes = await fetch(
      `${FOOTBALL_API_BASE}/competitions/WC/matches?status=FINISHED`,
      { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! } }
    )
    if (!apiRes.ok) {
      const text = await apiRes.text()
      throw new Error(`API ${apiRes.status}: ${text}`)
    }
    const { matches: apiMatches } = await apiRes.json()

    // 2. Unsere noch nicht abgeschlossenen Spiele laden
    const { data: dbMatches, error: dbErr } = await supabase
      .from('matches')
      .select('id, kickoff, home_team:home_team_id(code), away_team:away_team_id(code)')
      .eq('is_finished', false)
      .not('home_team_id', 'is', null)

    if (dbErr) throw dbErr
    if (!dbMatches?.length) {
      return res.status(200).json({ message: 'Keine offenen Spiele in der DB' })
    }

    // 3. Für jedes fertige API-Spiel: passendes DB-Spiel suchen und updaten
    let updated = 0
    const unmatched: string[] = []

    for (const m of apiMatches) {
      const homeScore = m.score?.fullTime?.home
      const awayScore = m.score?.fullTime?.away
      if (homeScore == null || awayScore == null) continue

      const apiTime  = new Date(m.utcDate).getTime()
      const homeTLA  = (m.homeTeam?.tla ?? '').toUpperCase()
      const awayTLA  = (m.awayTeam?.tla ?? '').toUpperCase()

      // Suche DB-Spiel: gleicher Zeitslot (±2h) + gleiche Teams
      const dbMatch = dbMatches.find(db => {
        const timeDiff = Math.abs(new Date(db.kickoff).getTime() - apiTime)
        const sameSlot  = timeDiff < 2 * 60 * 60 * 1000
        const homeMatch = toApiCode((db.home_team as { code: string })?.code ?? '') === homeTLA
        const awayMatch = toApiCode((db.away_team as { code: string })?.code ?? '') === awayTLA
        return sameSlot && homeMatch && awayMatch
      })

      if (!dbMatch) {
        unmatched.push(`${homeTLA} vs ${awayTLA}`)
        continue
      }

      const { error } = await supabase.rpc('finish_match', {
        p_match_id:   dbMatch.id,
        p_home_score: homeScore,
        p_away_score: awayScore,
      })
      if (!error) updated++
    }

    return res.status(200).json({
      updated,
      skipped: unmatched.length,
      unmatched,
    })
  } catch (err) {
    console.error('[sync-results]', err)
    return res.status(500).json({ error: String(err) })
  }
}
