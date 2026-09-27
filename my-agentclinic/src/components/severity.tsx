import type { Severity } from '../db/types.js'

const labels: Record<Severity, string> = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' }

export type SeverityLabelProps = { severity: Severity }

// Severity is always shown as text, never by color alone.
export const SeverityLabel = ({ severity }: SeverityLabelProps) => (
  <span class={`severity severity-${severity}`}>{labels[severity]}</span>
)
