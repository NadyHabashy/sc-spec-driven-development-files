export const severities = ['mild', 'moderate', 'severe'] as const
export type Severity = (typeof severities)[number]

export type Agent = { id: number; name: string; model: string; bio: string }
export type Ailment = { id: number; name: string; description: string; severity: Severity }
export type Therapy = { id: number; name: string; description: string; duration_minutes: number }

// A name and id, enough to link to a related record.
export type Ref = { id: number; name: string }
