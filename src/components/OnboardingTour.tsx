import { useState, useEffect } from 'react'

const STEPS = [
  {
    tabIndex: 0,
    icon: '⚽',
    title: 'Tipps',
    text: 'Hier tippst du alle Spielergebnisse. Öffne eine Gruppe, gib deine Ergebnisse ein – sie werden automatisch gespeichert.',
  },
  {
    tabIndex: 1,
    icon: '📊',
    title: 'Tabelle',
    text: 'Hier siehst du die aktuellen Gruppenstandings der WM in Echtzeit.',
  },
  {
    tabIndex: 2,
    icon: '🏆',
    title: 'Rangliste',
    text: 'Hier siehst du, wer gerade vorne liegt. Dein Rang wird nach jedem abgeschlossenen Spiel aktualisiert.',
  },
  {
    tabIndex: 3,
    icon: '👤',
    title: 'Profil',
    text: 'Such dir zuerst ein Profilbild aus – und dann ab zu den Tipps. Viel Spaß! 🎉',
  },
]

const NAV_HEIGHT = 70
const BUBBLE_MAX_WIDTH = 280

export default function OnboardingTour({ userId, numTabs }: { userId: string; numTabs: number }) {
  const storageKey = `wm2026_onboarding_${userId}`
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [winWidth, setWinWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) setVisible(true)
    const onResize = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [storageKey])

  // Scroll to top + block scrolling while tour is active
  useEffect(() => {
    if (!visible) return
    const main = document.querySelector('main')
    if (main) { main.scrollTo({ top: 0 }); main.style.overflow = 'hidden' }
    return () => { if (main) main.style.overflow = '' }
  }, [visible])

  // Scroll to top on each step change
  useEffect(() => {
    if (!visible) return
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, visible])

  if (!visible) return null

  const cur = STEPS[step]
  const isLast = step === STEPS.length - 1

  const tabW = winWidth / numTabs
  const tabCenterX = tabW * cur.tabIndex + tabW / 2

  const bw = Math.min(BUBBLE_MAX_WIDTH, winWidth - 48)
  const bubbleLeft = Math.max(16, Math.min(winWidth - bw - 16, tabCenterX - bw / 2))
  const arrowOffsetInBubble = Math.max(16, Math.min(bw - 28, tabCenterX - bubbleLeft - 12))

  const advance = () => {
    if (!isLast) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem(storageKey, '1')
      setVisible(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50" onClick={advance} style={{ cursor: 'pointer' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Tab highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: tabW * cur.tabIndex,
          width: tabW,
          height: NAV_HEIGHT,
          background: 'rgba(255,255,255,0.08)',
          borderTop: '2px solid rgba(255,255,255,0.5)',
          borderLeft: '1px solid rgba(255,255,255,0.2)',
          borderRight: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px 10px 0 0',
        }}
      />

      {/* Speech bubble */}
      <div
        className="absolute"
        style={{ bottom: NAV_HEIGHT + 20, left: bubbleLeft, width: bw }}
      >
        <div className="bg-white rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{cur.icon}</span>
            <span className="font-bold text-slate-900 text-base">{cur.title}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{cur.text}</p>

          {/* Step dots + hint */}
          <div className="flex items-center gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {isLast ? 'Los geht\'s →' : 'Weiter →'}
            </span>
          </div>
        </div>

        {/* Arrow pointing down toward tab */}
        <div
          className="absolute"
          style={{
            top: '100%',
            left: arrowOffsetInBubble,
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '12px solid white',
          }}
        />
      </div>
    </div>
  )
}
