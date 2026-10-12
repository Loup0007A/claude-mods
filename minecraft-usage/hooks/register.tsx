import { atom, read, update } from 'claude-code'
import type { EngineInterface, RenderChildren, Register, SessionContextUsage, SessionCost, SessionRateLimit } from 'claude-code'

import type { Gauges } from '../types'
import { MC, bar, describeWindow, hearts, remaining, sortLimits, statusText, tierColor, until } from './mc'

const PANE = 'minecraft-usage'
const TITLE = '⛏ Claude Craft'
const EMPTY: Gauges = { limits: [], contextPercent: null, contextWindow: 0, costUsd: null }

const gauges = atom({ plugin: 'minecraft-usage', key: 'gauges' } as const, EMPTY)
const now = atom({ plugin: 'minecraft-usage', key: 'now' } as const, 0)

const save = async (
  $: EngineInterface,
  limits: SessionRateLimit[],
  context: SessionContextUsage,
  cost: SessionCost | undefined,
) => {
  await update($, gauges, () => ({
    limits,
    contextPercent: context.percent ?? null,
    contextWindow: context.window,
    costUsd: cost?.usd ?? null,
  }))
  await update($, now, () => Date.now())
  $.ui.status(statusText(limits))
}

const open = ($: EngineInterface) => $.ui.open({ id: PANE, title: TITLE, columns: 36 })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'mc-usage',
      description: 'Ouvre le dashboard Minecraft des limites Claude restantes',
    })
    void open($)
    const usage = await $.session.usage()
    await save($, usage.rateLimits, usage.context, usage.cost)
    // Keeps the reset countdowns moving between measurements.
    $.clock.every(30_000, () => void update($, now, () => Date.now()))

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await save($, e.rateLimits, e.context, e.cost)

    return next(e)
  })

  on('command.run', { command: 'mc-usage' }, async $ => {
    await open($)

    return { text: 'Dashboard Claude Craft ouvert.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const g = await read($, gauges)
    const t = (await read($, now)) || Date.now()
    const width = Math.max(10, Math.min(24, (e.props.bodyColumns ?? 36) - 8))
    const limits = sortLimits(g.limits)

    const gauge = (key: string, icon: string, label: string, color: string, left: number, foot: string | null, extra?: RenderChildren) => {
      const b = bar(left, width)

      return (
        <Box key={key} flexDirection="column" marginBottom={1}>
          <Text bold color={color}>
            {icon} {label}
          </Text>
          <Text>
            <Text color={MC.stone}>[</Text>
            <Text color={tierColor(left)}>{b.full}</Text>
            <Text color={MC.dirt}>{b.empty}</Text>
            <Text color={MC.stone}>]</Text> <Text bold color={tierColor(left)}>{Math.round(left)}%</Text>
          </Text>
          {extra}
          {foot && <Text dimColor>⟳ reset dans {foot}</Text>}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" borderStyle="round" borderColor={MC.dirt} paddingX={1}>
        <Text bold color={MC.grass}>
          ▀▄▀ CLAUDE CRAFT ▀▄▀
        </Text>
        <Text dimColor>tokens restants</Text>
        <Text color={MC.dirt}>{'▔'.repeat(width + 7)}</Text>
        {limits.length === 0 && (
          <Box marginBottom={1} flexDirection="column">
            <Text color={MC.gold}>⚠ Pas encore de relevé.</Text>
            <Text dimColor>Les limites arrivent après la 1re réponse (abonnement Pro/Max).</Text>
          </Box>
        )}
        {limits.map(l => {
          const w = describeWindow(l.kind)
          const left = remaining(l.percentUsed)
          const life = hearts(left)
          const extra =
            l.kind === 'five_hour' ? (
              <Text>
                <Text color={MC.redstone}>{life.full}</Text>
                <Text color={MC.stone}>{life.empty}</Text>
              </Text>
            ) : undefined

          return gauge(l.kind, w.icon, w.label, w.color, left, until(l.resetsAt, t), extra)
        })}
        {g.contextPercent !== null &&
          gauge(
            'context',
            '▣',
            `Inventaire · contexte ${Math.round(g.contextWindow / 1000)}k`,
            MC.dirt,
            remaining(g.contextPercent),
            null,
          )}
        {g.costUsd !== null && (
          <Text color={MC.emerald}>◎ {g.costUsd.toFixed(2)} $ dépensés cette session</Text>
        )}
      </Box>
    )
  })
}
