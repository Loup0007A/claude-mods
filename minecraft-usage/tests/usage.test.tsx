import { expect, test } from 'claude-code/testing'

import { bar, hearts, remaining, statusText, until } from '../hooks/mc'

const PANE = {
  component: 'Pane',
  requestId: 'minecraft-usage',
  props: {
    title: '⛏ Claude Craft',
    isFocused: false,
    bodyColumns: 36,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('gauges turn used percent into what is left', async () => {
  expect(remaining(36)).toBe(64)
  expect(remaining(120)).toBe(0)
  expect(bar(50, 10)).toEqual({ full: '█████', empty: '░░░░░' })
  expect(hearts(64).full).toBe('♥♥♥♥♥♥')
  expect(until('2026-10-12T02:13:00Z', Date.parse('2026-10-12T00:00:00Z'))).toBe('2 h 13')
  expect(statusText([{ kind: 'seven_day', percentUsed: 20 }, { kind: 'five_hour', percentUsed: 36 }])).toBe('⛏ ♥ 64% · ◆ 80%')
})

test('the pane draws every window after a measurement', async ($, on) => {
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('ui.status', () => ({ value: undefined }))
  await $.session.measure({
    context: { window: 200_000, percent: 25 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 36, resetsAt: '2099-01-01T00:00:00Z' },
      { kind: 'seven_day', percentUsed: 20 },
      { kind: 'seven_day_opus', percentUsed: 85 },
    ],
    changed: ['rateLimits', 'context'],
  })
  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ plugin: 'minecraft-usage', surface, ...PANE })
    expect(await ui.find({ type: 'Text', text: /Session · 5 h/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Semaine · tous modèles/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Semaine · Opus/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^64%$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^15%$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Inventaire/ })).toBeDefined()
  }
})
