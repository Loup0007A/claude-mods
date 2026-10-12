import type { SessionRateLimit } from 'claude-code'

export type Tier = { color: string; name: string }

// Minecraft palette: grass, gold, redstone, diamond, enchant, dirt, emerald.
export const MC = {
  grass: '#5D9C3A',
  gold: '#FCDB05',
  redstone: '#E0301E',
  diamond: '#4AEDD9',
  enchant: '#B57EDC',
  dirt: '#866043',
  emerald: '#17DD62',
  stone: '#8B8B8B',
} as const

export type Window = { icon: string; label: string; color: string }

const WINDOWS: Record<string, Window> = {
  five_hour: { icon: '♥', label: 'Session · 5 h', color: MC.redstone },
  seven_day: { icon: '◆', label: 'Semaine · tous modèles', color: MC.diamond },
  seven_day_opus: { icon: '✦', label: 'Semaine · Opus', color: MC.enchant },
  seven_day_sonnet: { icon: '✧', label: 'Semaine · Sonnet', color: MC.enchant },
  spend_limit: { icon: '◎', label: 'Budget', color: MC.emerald },
}

const ORDER = ['five_hour', 'seven_day', 'seven_day_opus', 'seven_day_sonnet', 'spend_limit']

export const describeWindow = (kind: string): Window =>
  WINDOWS[kind] ?? { icon: '▪', label: kind.replace(/_/g, ' '), color: MC.stone }

export const sortLimits = (limits: SessionRateLimit[]): SessionRateLimit[] =>
  [...limits].sort((a, b) => {
    const ia = ORDER.indexOf(a.kind)
    const ib = ORDER.indexOf(b.kind)

    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })

export const remaining = (percentUsed: number): number =>
  Math.max(0, Math.min(100, Math.round((100 - percentUsed) * 10) / 10))

// Green while plenty is left, gold when it runs low, redstone when nearly out.
export const tierColor = (left: number): string =>
  left > 50 ? MC.grass : left > 20 ? MC.gold : MC.redstone

export const bar = (left: number, width: number): { full: string; empty: string } => {
  const filled = Math.round((left / 100) * width)

  return { full: '█'.repeat(filled), empty: '░'.repeat(width - filled) }
}

// Ten hearts, one per 10 % left, as the survival health bar.
export const hearts = (left: number): { full: string; empty: string } => {
  const n = Math.round(left / 10)

  return { full: '♥'.repeat(n), empty: '♡'.repeat(10 - n) }
}

export const until = (resetsAt: string | undefined, now: number): string | null => {
  if (!resetsAt) {
    return null
  }
  const at = Date.parse(resetsAt)
  if (Number.isNaN(at)) {
    return null
  }
  const minutes = Math.max(0, Math.round((at - now) / 60000))
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} h ${String(minutes % 60).padStart(2, '0')}`
  }

  return `${Math.floor(hours / 24)} j ${hours % 24} h`
}

export const statusText = (limits: SessionRateLimit[]): string | undefined => {
  if (limits.length === 0) {
    return undefined
  }
  const parts = sortLimits(limits).map(
    l => `${describeWindow(l.kind).icon} ${Math.round(remaining(l.percentUsed))}%`,
  )

  return `⛏ ${parts.join(' · ')}`
}
