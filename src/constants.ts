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

export const STORAGE_KEY_BPM = "vibe-metronome-bpm";
export const STORAGE_KEY_BEATS = "vibe-metronome-beats";
export const STORAGE_KEY_STATES = "vibe-metronome-beat-states";
export const STORAGE_KEY_STEP_STATES = "vibe-metronome-step-states";
export const STORAGE_KEY_SUBDIV_VAL = "vibe-metronome-subdiv-value";
export const STORAGE_KEY_SOUND = "vibe-metronome-sound-preset";
export const STORAGE_KEY_SAVED_BPMS = "vibe-metronome-saved-bpms";
export const STORAGE_KEY_PRESETS = "vibe-metronome-presets";
export const STORAGE_KEY_SPEED_TRAINER = "vibe-metronome-speed-trainer";
export const STORAGE_KEY_INTERVAL_TRAINER = "vibe-metronome-interval-trainer";
export const STORAGE_KEY_SWING = "vibe-metronome-swing";
export const STORAGE_KEY_SHIFT = "vibe-metronome-shift";
export const STORAGE_KEY_THEME = "vibe-metronome-theme";

export type Theme =
  | "cyberpunk"
  | "kids"
  | "swiss"
  | "zen"
  | "e-ink"
  | "neumorphism"
  | "amoled"
  | "retro"
  | "blueprint"
  | "aurora"
  | "terminal"
  | "brutalism"
  | "clay"
  | "sketch"
  | "mechanical"
  | "wood";

export const DEFAULT_THEME = "amoled";

export const THEMES: { id: Theme; label: string }[] = [
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "kids", label: "Kids Pop" },
  { id: "swiss", label: "Swiss Style" },
  { id: "zen", label: "Zen Mode" },
  { id: "e-ink", label: "E-Paper" },
  { id: "neumorphism", label: "Neumorphism" },
  { id: "amoled", label: "Amoled" },
  { id: "retro", label: "Retro" },
  { id: "blueprint", label: "Blueprint" },
  { id: "aurora", label: "Aurora" },
  { id: "terminal", label: "Hacker Terminal" },
  { id: "brutalism", label: "Neo Brutalism" },
  { id: "clay", label: "Soft Clay" },
  { id: "sketch", label: "Paper Sketch" },
  { id: "mechanical", label: "Industrial" },
  { id: "wood", label: "Classic Mahogany" },
];

export interface Preset {
  id: string;
  name: string;
  bpm: number;
  beatsPerMeasure: number;
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
