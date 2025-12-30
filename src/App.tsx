import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, HelpCircle, Music2, Pause, Play, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import { STORAGE_KEY_LANGUAGE, type Language } from "./i18n";

// Import Components
import { BpmDisplay } from "./components/BpmDisplay";
import { BpmHistoryBar } from "./components/BpmHistoryBar";
import { CustomGlassSelect } from "./components/CustomGlassSelect";
import { HelpModal } from "./components/HelpModal";
import { LiquidGlassDock } from "./components/LiquidGlassDock";
import { PresetsModal } from "./components/PresetsModal";
import { RhythmTrainerModal } from "./components/RhythmTrainerModal";
import { SpeedTrainerModal } from "./components/SpeedTrainerModal";
import { TrainerDock } from "./components/TrainerDock";
import { Visualizer } from "./components/Visualizer";

import {
  BEAT_ACCENT,
  BEAT_MUTE,
  BEAT_NORMAL,
  BEAT_SUB_ACCENT,
  MAX_BPM,
  MIN_BPM,
  SOUND_DRUM,
  SOUND_MECH,
  SOUND_SINE,
  SOUND_WOOD,
  STORAGE_KEY_BEATS,
  STORAGE_KEY_BPM,
  STORAGE_KEY_PRESETS,
  STORAGE_KEY_RHYTHM_TRAINER,
  STORAGE_KEY_SAVED_BPMS,
  STORAGE_KEY_SOUND,
  STORAGE_KEY_SPEED_TRAINER,
  STORAGE_KEY_STEP_STATES,
  STORAGE_KEY_SUBDIV_VAL,
  TAP_TIMEOUT,
  type Preset,
  type RhythmTrainerConfig,
  type SpeedTrainerConfig,
} from "./constants";
import { useMetronome } from "./hooks/useMetronome";
import { translations } from "./i18n";

// --- Helper: Safe LocalStorage Access (Typed) ---
function getStorageItem<T>(
  key: string,
  defaultValue: T,
  parser: ((val: string) => T) | null = null
): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return parser ? parser(item) : (item as unknown as T);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

const setStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    const valueToStore = typeof value === "object" ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, valueToStore);
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
};

export default function MetronomeApp() {
  const [bpm, setBpm] = useState<number>(() =>
    getStorageItem(STORAGE_KEY_BPM, 120, (v) =>
      Math.min(Math.max(parseInt(v, 10), MIN_BPM), MAX_BPM)
    )
  );
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(() =>
    getStorageItem(STORAGE_KEY_BEATS, 4, (v) => Math.max(parseInt(v, 10), 1))
  );
  const [subdivision, setSubdivision] = useState<number>(() =>
    getStorageItem(STORAGE_KEY_SUBDIV_VAL, 1, (v) => parseInt(v, 10))
  );
  const [soundPreset, setSoundPreset] = useState<string>(() =>
    getStorageItem(STORAGE_KEY_SOUND, SOUND_SINE)
  );
  const [savedBpms, setSavedBpms] = useState<number[]>(() =>
    getStorageItem(STORAGE_KEY_SAVED_BPMS, [], JSON.parse)
  );

  // Helper to create a default beat chunk (Main + Subdivisions)
  const createDefaultBeat = (subdivs: number, visualIndex: number) => {
    const chunk = [];
    chunk.push(visualIndex === 0 ? BEAT_ACCENT : BEAT_NORMAL);
    for (let i = 1; i < subdivs; i++) chunk.push(BEAT_NORMAL);
    return chunk;
  };

  // Unified Step States: Stores the state (Accent, Sub, Normal, Mute) for every tick
  const [stepStates, setStepStates] = useState<number[]>(() => {
    const saved = getStorageItem(STORAGE_KEY_STEP_STATES, [] as number[], JSON.parse);
    const requiredLength = beatsPerMeasure * subdivision;

    // Validation: If saved data matches current dimension requirements, use it.
    if (Array.isArray(saved) && saved.length === requiredLength) {
      return saved;
    }

    // Fallback: Generate default pattern
    const newSteps: number[] = [];
    for (let b = 0; b < beatsPerMeasure; b++) {
      const chunk = [];
      chunk.push(b === 0 ? BEAT_ACCENT : BEAT_NORMAL);
      for (let i = 1; i < subdivision; i++) chunk.push(BEAT_NORMAL);
      newSteps.push(...chunk);
    }
    return newSteps;
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Language state (default: English)
  const [language, setLanguage] = useState<Language>(
    () => getStorageItem(STORAGE_KEY_LANGUAGE, "en" as Language) as Language
  );

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  };

  // --- Trainer States ---
  const [speedTrainer, setSpeedTrainer] = useState<SpeedTrainerConfig>(() =>
    getStorageItem(
      STORAGE_KEY_SPEED_TRAINER,
      { enabled: false, increment: 5, everyMeasures: 4, targetBpm: 200 },
      JSON.parse
    )
  );
  const [rhythmTrainer, setRhythmTrainer] = useState<RhythmTrainerConfig>(() =>
    getStorageItem(
      STORAGE_KEY_RHYTHM_TRAINER,
      { enabled: false, playBars: 3, muteBars: 1 },
      JSON.parse
    )
  );
  const [presets, setPresets] = useState<Preset[]>(() =>
    getStorageItem(STORAGE_KEY_PRESETS, [] as Preset[], JSON.parse)
  );

  // Modal visibility
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showRhythmModal, setShowRhythmModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  // ... (Effect for resizing stepStates on config change - same as before) ...
  useEffect(() => {
    setStepStates((prev) => {
      const currentTotal = prev.length;
      const targetTotal = beatsPerMeasure * subdivision;
      if (currentTotal === targetTotal) return prev;

      // Reset to Defaults when structure changes
      const newSteps: number[] = [];
      for (let b = 0; b < beatsPerMeasure; b++) {
        // simplified inline default generation
        newSteps.push(b === 0 ? BEAT_ACCENT : BEAT_NORMAL);
        for (let i = 1; i < subdivision; i++) newSteps.push(BEAT_NORMAL);
      }
      return newSteps;
    });
  }, [beatsPerMeasure, subdivision]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_BPM, bpm);
    setStorageItem(STORAGE_KEY_BEATS, beatsPerMeasure);
    setStorageItem(STORAGE_KEY_STEP_STATES, stepStates);
    setStorageItem(STORAGE_KEY_SUBDIV_VAL, subdivision);
    setStorageItem(STORAGE_KEY_SOUND, soundPreset);
    setStorageItem(STORAGE_KEY_SAVED_BPMS, savedBpms);
    setStorageItem(STORAGE_KEY_SPEED_TRAINER, speedTrainer);
    setStorageItem(STORAGE_KEY_RHYTHM_TRAINER, rhythmTrainer);
    setStorageItem(STORAGE_KEY_PRESETS, presets);
    setStorageItem(STORAGE_KEY_LANGUAGE, language);
  }, [
    bpm,
    beatsPerMeasure,
    stepStates,
    subdivision,
    soundPreset,
    savedBpms,
    speedTrainer,
    rhythmTrainer,
    presets,
    language,
  ]);

  const toggleStepState = (i: number) =>
    setStepStates((p) => {
      const n = [...p];
      const current = n[i] ?? BEAT_NORMAL;
      let next: number;
      // Cycle: Mute(2) -> Normal(0) -> SubAccent(3) -> Accent(1) -> Mute(2)
      // "Click to Strengthen"
      if (current === BEAT_MUTE) next = BEAT_NORMAL;
      else if (current === BEAT_NORMAL) next = BEAT_SUB_ACCENT;
      else if (current === BEAT_SUB_ACCENT) next = BEAT_ACCENT;
      else next = BEAT_MUTE;

      n[i] = next;
      return n;
    });

  // Speed Trainer: Handle measure completion callback
  const handleMeasureComplete = (measure: number) => {
    if (!speedTrainer.enabled) return;
    if (bpm >= speedTrainer.targetBpm) return; // Already at target

    // Check if this measure is a trigger point
    if (measure > 0 && measure % speedTrainer.everyMeasures === 0) {
      const newBpm = Math.min(bpm + speedTrainer.increment, speedTrainer.targetBpm, MAX_BPM);
      setBpm(newBpm);
    }
  };

  const { isPlaying, setIsPlaying, visualBeat, ensureAudioContext, measureCount, isMeasureMuted } =
    useMetronome(bpm, beatsPerMeasure, subdivision, soundPreset, stepStates, {
      rhythmTrainer,
      onMeasureComplete: handleMeasureComplete,
    });

  const tapTimes = useRef<number[]>([]);
  const handleTap = () => {
    ensureAudioContext();
    const now = Date.now();
    if (
      tapTimes.current.length > 0 &&
      now - tapTimes.current[tapTimes.current.length - 1] > TAP_TIMEOUT
    ) {
      tapTimes.current = [];
    }
    tapTimes.current.push(now);
    if (tapTimes.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }
      if (intervals.length > 4) intervals.shift();
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      setBpm(Math.min(Math.max(Math.round(60000 / avg), MIN_BPM), MAX_BPM));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const step = e.shiftKey ? 5 : 1;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setBpm((b) => Math.min(b + step, MAX_BPM));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setBpm((b) => Math.max(b - step, MIN_BPM));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsPlaying]);

  // --- Configuration Options ---
  const beatOptions = [2, 3, 4, 5, 6].map((b) => ({ label: `${b}/4`, value: b }));
  const soundOptions = [
    { label: translations.options.sounds.sine[language], value: SOUND_SINE },
    { label: translations.options.sounds.wood[language], value: SOUND_WOOD },
    { label: translations.options.sounds.drum[language], value: SOUND_DRUM },
    { label: translations.options.sounds.mech[language], value: SOUND_MECH },
  ];
  const subdivOptions = [
    { label: translations.options.subdivisions.qtr[language], value: 1 },
    { label: translations.options.subdivisions.eighth[language], value: 2 },
    { label: translations.options.subdivisions.triplet[language], value: 3 },
    { label: translations.options.subdivisions.sixteenth[language], value: 4 },
  ];

  const getSoundDisplay = (val: string) => {
    const opt = soundOptions.find((o) => o.value === val);
    return opt ? opt.label : "SINE";
  };

  // --- Preset Handlers ---
  const handleSavePreset = (name: string) => {
    const newPreset: Preset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      bpm,
      beatsPerMeasure,
      subdivision,
      soundPreset,
      stepStates: [...stepStates],
      createdAt: Date.now(),
    };
    setPresets((prev) => [newPreset, ...prev]);
  };

  const handleLoadPreset = (preset: Preset) => {
    setBpm(preset.bpm);
    setBeatsPerMeasure(preset.beatsPerMeasure);
    setSubdivision(preset.subdivision);
    setSoundPreset(preset.soundPreset);
    // stepStates will be regenerated by the useEffect when beats/subdiv change
    // But we want to restore the exact pattern, so we need to set it after a tick
    setTimeout(() => setStepStates(preset.stepStates), 0);
    setShowPresetsModal(false);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className={styles.app}>
      {/* HEADER BUTTONS */}
      <div className={styles["header-buttons"]}>
        <button
          onClick={toggleLanguage}
          className={styles["header-btn"]}
          title={language === "en" ? "切换到中文" : "Switch to English"}
        >
          <Globe size={18} />
          <span className={styles["header-btn__label"]}>{language === "en" ? "EN" : "中"}</span>
        </button>
        <button onClick={() => setIsHelpOpen(true)} className={styles["header-btn"]}>
          <HelpCircle size={20} />
        </button>
      </div>
      <AnimatePresence>
        {isHelpOpen && (
          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} language={language} />
        )}
      </AnimatePresence>

      {/* BACKGROUND */}
      <div className={styles["app__bg-gradient"]} />
      {/* Optional: Keeping noise overlay for texture if it's lightweight enough, usually is */}
      <div className={styles["app__noise-overlay"]} />

      {/* MAIN CONTAINER: CENTERED LAYOUT WITH UNIFIED SPACING */}
      <div className={styles["app__content"]}>
        {/* BLOCK 1: BPM & HISTORY */}
        <div className={styles["bpm-section"]}>
          <BpmDisplay bpm={bpm} setBpm={setBpm} />
          <BpmHistoryBar
            currentBpm={bpm}
            setBpm={setBpm}
            savedBpms={savedBpms}
            setSavedBpms={setSavedBpms}
            onTap={handleTap}
            language={language}
          />
        </div>

        {/* BLOCK 2: VISUALIZER */}
        <div className={styles["visualizer-section"]}>
          <Visualizer
            activeBeat={visualBeat}
            beatsPerMeasure={beatsPerMeasure}
            subdivision={subdivision}
            stepStates={stepStates}
            toggleStepState={toggleStepState}
          />
          <div className={styles["subdivision-row"]}>
            {subdivOptions.map((opt) => (
              <button
                key={opt.value}
                className={clsx(
                  styles["subdivision-btn"],
                  subdivision === opt.value && styles["subdivision-btn--active"]
                )}
                onClick={() => setSubdivision(opt.value)}
              >
                {opt.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* BLOCK 3: DOCK */}
        <div className={styles["dock-section"]}>
          {/* Trainer Dock (Secondary) */}
          <TrainerDock
            speedTrainer={speedTrainer}
            rhythmTrainer={rhythmTrainer}
            onSpeedClick={() => setShowSpeedModal(true)}
            onRhythmClick={() => setShowRhythmModal(true)}
            onPresetsClick={() => setShowPresetsModal(true)}
            language={language}
          />

          {/* Main Dock */}
          <LiquidGlassDock>
            {/* 1. Time Signature Select (Left) */}
            <CustomGlassSelect
              icon={Music2}
              value={beatsPerMeasure}
              onChange={(v) => setBeatsPerMeasure(parseInt(v))}
              options={beatOptions}
              title={translations.dock.timeSignature[language]}
              displayLabel={`${beatsPerMeasure}/4`}
              alignment="left"
            />

            {/* 2. Play (Center) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={clsx(
                styles["play-btn"],
                isPlaying ? styles["play-btn--playing"] : styles["play-btn--stopped"]
              )}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </motion.button>

            {/* 3. Sound Preset Select (Right) */}
            <CustomGlassSelect
              icon={Waves}
              value={soundPreset}
              onChange={setSoundPreset}
              options={soundOptions}
              title={translations.dock.soundPreset[language]}
              displayLabel={getSoundDisplay(soundPreset)}
              alignment="right"
            />
          </LiquidGlassDock>
        </div>
      </div>

      {/* TRAINER MODALS */}
      <AnimatePresence>
        {showSpeedModal && (
          <SpeedTrainerModal
            config={speedTrainer}
            onConfigChange={setSpeedTrainer}
            onClose={() => setShowSpeedModal(false)}
            currentBpm={bpm}
            measureCount={measureCount}
            language={language}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRhythmModal && (
          <RhythmTrainerModal
            config={rhythmTrainer}
            onConfigChange={setRhythmTrainer}
            onClose={() => setShowRhythmModal(false)}
            measureCount={measureCount}
            isMuted={isMeasureMuted}
            language={language}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPresetsModal && (
          <PresetsModal
            presets={presets}
            onSave={handleSavePreset}
            onLoad={handleLoadPreset}
            onDelete={handleDeletePreset}
            onClose={() => setShowPresetsModal(false)}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
