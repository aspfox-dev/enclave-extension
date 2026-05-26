import { MODE_DESCRIPTIONS, MODE_LABELS } from './strings';

export type ModeId = keyof typeof MODE_LABELS;

export interface ModeDefinition {
  id: ModeId;
  label: string;
  description: string;
}

export const MODES: ModeDefinition[] = (Object.keys(MODE_LABELS) as ModeId[]).map((id) => ({
  id,
  label: MODE_LABELS[id],
  description: MODE_DESCRIPTIONS[id],
}));

export const DEFAULT_MODE: ModeId = 'agent';
