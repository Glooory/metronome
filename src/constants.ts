export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const SPEED_TRAINER_LIMITS = {
  everyMeasures: { min: 1, max: 300 },
  increment: { min: 1, max: 50 },
  targetBpm: { min: MIN_BPM, max: MAX_BPM },
} as const;
export const INTERVAL_TRAINER_LIMITS = {
  playBars: { min: 1, max: 40 },
  muteBars: { min: 1, max: 10 },
} as const;
export const TAP_TIMEOUT = 2000;
export const LOOKAHEAD = 25.0;
export const SCHEDULE_AHEAD_TIME = 0.1;

export const MIN_BEATS_PER_MEASURE = 1;
export const MAX_BEATS_PER_MEASURE = 16;
export const DEFAULT_BEAT_UNIT = 4;
export const DEFAULT_BPM_BIND_NOTE = 0.25;

export const TIME_SIGNATURE_DENOMINATORS = [2, 4, 8, 16] as const;
export const SUBDIVISION_VALUES = [1, 2, 3, 4] as const;

export const BEAT_NORMAL = 0;
export const BEAT_ACCENT = 1;
export const BEAT_MUTE = 2;
export const BEAT_SUB_ACCENT = 3;

export const SOUND_SINE = "sine";
export const SOUND_WOOD = "wood";
export const SOUND_DRUM = "drum";
export const SOUND_MECH = "mech";

export const BPM_BIND_NOTE_OPTIONS = [
  { value: 0.5, label: "1/2" },
  { value: 0.25, label: "1/4" },
  { value: 0.125, label: "1/8" },
  { value: 0.0625, label: "1/16" },
  { value: 0.75, label: "1/2." },
  { value: 0.375, label: "1/4." },
  { value: 0.1875, label: "1/8." },
] as const;

export const STORAGE_KEY_BPM = "vibe-metronome-bpm";
export const STORAGE_KEY_BEATS = "vibe-metronome-beats";
export const STORAGE_KEY_BEAT_UNIT = "vibe-metronome-beat-unit";
export const STORAGE_KEY_BPM_BIND_NOTE = "vibe-metronome-bpm-bind-note";
export const STORAGE_KEY_STATES = "vibe-metronome-beat-states";
export const STORAGE_KEY_STEP_STATES = "vibe-metronome-step-states";
export const STORAGE_KEY_SUBDIV_VAL = "vibe-metronome-subdiv-value";
export const STORAGE_KEY_SOUND = "vibe-metronome-sound-preset";
export const STORAGE_KEY_FAVORITE_BPMS = "vibe-metronome-saved-bpms";
export const STORAGE_KEY_PRESETS = "vibe-metronome-presets";
export const STORAGE_KEY_SPEED_TRAINER = "vibe-metronome-speed-trainer";
export const STORAGE_KEY_INTERVAL_TRAINER = "vibe-metronome-interval-trainer";
export const STORAGE_KEY_SWING = "vibe-metronome-swing";
export const STORAGE_KEY_SHIFT = "vibe-metronome-shift";
export const STORAGE_KEY_THEME = "vibe-metronome-theme";

export interface Preset {
  id: string;
  name: string;
  bpm: number;
  beatsPerMeasure: number;
  beatUnit?: number;
  bpmBindNote?: number;
  subdivision: number;
  soundPreset: string;
  stepStates: number[];
  swing?: number;
  shift?: number;
  createdAt: number;
}

export interface SpeedTrainerConfig {
  enabled: boolean;
  increment: number;
  everyMeasures: number;
  targetBpm: number;
}

export interface IntervalTrainerConfig {
  enabled: boolean;
  playBars: number;
  muteBars: number;
}
