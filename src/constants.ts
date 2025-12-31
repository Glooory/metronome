export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const TAP_TIMEOUT = 2000;
export const LOOKAHEAD = 25.0;
export const SCHEDULE_AHEAD_TIME = 0.1;

export const BEAT_NORMAL = 0;
export const BEAT_ACCENT = 1;
export const BEAT_MUTE = 2;
export const BEAT_SUB_ACCENT = 3;

export const SOUND_SINE = "sine";
export const SOUND_WOOD = "wood";
export const SOUND_DRUM = "drum";
export const SOUND_MECH = "mech";

export const STORAGE_KEY_BPM = "spatial-metronome-bpm";
export const STORAGE_KEY_BEATS = "spatial-metronome-beats";
export const STORAGE_KEY_STATES = "spatial-metronome-beat-states";
export const STORAGE_KEY_STEP_STATES = "spatial-metronome-step-states";
export const STORAGE_KEY_SUBDIV_VAL = "spatial-metronome-subdiv-value";
export const STORAGE_KEY_SOUND = "spatial-metronome-sound-preset";
export const STORAGE_KEY_SAVED_BPMS = "spatial-metronome-saved-bpms";
export const STORAGE_KEY_PRESETS = "spatial-metronome-presets";
export const STORAGE_KEY_SPEED_TRAINER = "spatial-metronome-speed-trainer";
export const STORAGE_KEY_RHYTHM_TRAINER = "spatial-metronome-rhythm-trainer";
export const STORAGE_KEY_THEME = "spatial-metronome-theme";

export type Theme = 'default' | 'cyberpunk' | 'kids' | 'swiss';

export const THEMES: { id: Theme; label: string }[] = [
  { id: 'default', label: 'Classic Dark' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'kids', label: 'Kids Pop' },
  { id: 'swiss', label: 'Swiss Style' },
];

export interface Preset {
  id: string;
  name: string;
  bpm: number;
  beatsPerMeasure: number;
  subdivision: number;
  soundPreset: string;
  stepStates: number[];
  createdAt: number;
}

export interface SpeedTrainerConfig {
  enabled: boolean;
  increment: number;
  everyMeasures: number;
  targetBpm: number;
}

export interface RhythmTrainerConfig {
  enabled: boolean;
  playBars: number;
  muteBars: number;
}
