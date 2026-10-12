export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Gauges = {
  limits: Limit[]
  contextPercent: number | null
  contextWindow: number
  costUsd: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'minecraft-usage': { gauges: Gauges; now: number }
  }
}
