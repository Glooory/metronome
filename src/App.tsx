import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, HelpCircle, Music2, Palette, Pause, Play, Shirt, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import styles from "./App.module.css";
import { STORAGE_KEY_LANGUAGE, type Language } from "./i18n";

import { BpmDisplay } from "./components/BpmDisplay";
import { BpmHistoryBar } from "./components/BpmHistoryBar";
import { CustomGlassSelect } from "./components/CustomGlassSelect";
import { HelpModal } from "./components/HelpModal";
import { IntervalTrainerModal } from "./components/IntervalTrainerModal";
import { LiquidGlassDock } from "./components/LiquidGlassDock";
import { PresetsModal } from "./components/PresetsModal";
import { SEO } from "./components/SEO";
import { SpeedTrainerModal } from "./components/SpeedTrainerModal";
import { SwingSettingModal } from "./components/SwingSettingModal";
import { TrainerDock } from "./components/TrainerDock";
import { Visualizer } from "./components/Visualizer";

import {
  BEAT_ACCENT,
  BEAT_MUTE,
  BEAT_NORMAL,
  BEAT_SUB_ACCENT,
  DEFAULT_THEME,
  MAX_BPM,
  MIN_BPM,
  SOUND_DRUM,
  SOUND_MECH,
  SOUND_SINE,
  SOUND_WOOD,
  STORAGE_KEY_BEATS,
  STORAGE_KEY_BPM,
  STORAGE_KEY_INTERVAL_TRAINER,
  STORAGE_KEY_PRESETS,
  STORAGE_KEY_SAVED_BPMS,
  STORAGE_KEY_SHIFT,
  STORAGE_KEY_SOUND,
  STORAGE_KEY_SPEED_TRAINER,
  STORAGE_KEY_STEP_STATES,
  STORAGE_KEY_SUBDIV_VAL,
  STORAGE_KEY_SWING,
  STORAGE_KEY_THEME,
  TAP_TIMEOUT,
  THEMES,
  type IntervalTrainerConfig,
  type Preset,
  type SpeedTrainerConfig,
  type Theme,
} from "./constants";
import { useMetronome } from "./hooks/useMetronome";
import { translations } from "./i18n";

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
  const [swing, setSwing] = useState<number>(() =>
    getStorageItem(STORAGE_KEY_SWING, 0, (v) => parseInt(v, 10))
  );
  const [shift, setShift] = useState<number>(() =>
    getStorageItem(STORAGE_KEY_SHIFT, 0, (v) => parseInt(v, 10))
  );
  const [soundPreset, setSoundPreset] = useState<string>(() =>
    getStorageItem(STORAGE_KEY_SOUND, SOUND_SINE)
  );
  const [savedBpms, setSavedBpms] = useState<number[]>(() =>
    getStorageItem(STORAGE_KEY_SAVED_BPMS, [], JSON.parse)
  );

  const [stepStates, setStepStates] = useState<number[]>(() => {
    const saved = getStorageItem(STORAGE_KEY_STEP_STATES, [] as number[], JSON.parse);
    const requiredLength = beatsPerMeasure * subdivision;

    if (Array.isArray(saved) && saved.length === requiredLength) {
      return saved;
    }

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

    const languages: { value: Language; label: string }[] = [
    { value: "en", label: "English" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
    { value: "es", label: "Español" },
    { value: "ru", label: "Русский" },
    { value: "pt", label: "Português" },
  ];

  const [language, setLanguage] = useState<Language>(() => {
    // SEO: Check URL param first for server-side like behavior
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (languages.find((l) => l.value === urlLang)) return urlLang as Language;
    }
    const _lang = getStorageItem(STORAGE_KEY_LANGUAGE, "en" as Language) as Language;
    return languages.find((l) => l.value === _lang)?.value || "en";
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const _theme = getStorageItem(STORAGE_KEY_THEME, DEFAULT_THEME) as Theme;
    return THEMES.find((t) => t.id === _theme)?.id || DEFAULT_THEME;
  });

  const [speedTrainer, setSpeedTrainer] = useState<SpeedTrainerConfig>(() =>
    getStorageItem(
      STORAGE_KEY_SPEED_TRAINER,
      { enabled: false, increment: 5, everyMeasures: 4, targetBpm: 200 },
      JSON.parse
    )
  );
  const [intervalTrainer, setIntervalTrainer] = useState<IntervalTrainerConfig>(() =>
    getStorageItem(
      STORAGE_KEY_INTERVAL_TRAINER,
      { enabled: false, playBars: 3, muteBars: 1 },
      JSON.parse
    )
  );
  const [presets, setPresets] = useState<Preset[]>(() =>
    getStorageItem(STORAGE_KEY_PRESETS, [] as Preset[], JSON.parse)
  );

  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [showSwingModal, setShowSwingModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  useEffect(() => {
    setStepStates((prev) => {
      const currentTotal = prev.length;
      const targetTotal = beatsPerMeasure * subdivision;
      if (currentTotal === targetTotal) return prev;

      const newSteps: number[] = [];
      for (let b = 0; b < beatsPerMeasure; b++) {
        newSteps.push(b === 0 ? BEAT_ACCENT : BEAT_NORMAL);
        for (let i = 1; i < subdivision; i++) newSteps.push(BEAT_NORMAL);
      }
      return newSteps;
    });
  }, [beatsPerMeasure, subdivision]);

  useEffect(() => {
    const totalSteps = stepStates.length;
    if (totalSteps > 0 && Math.abs(shift) >= totalSteps) {
      setShift(0);
    }
  }, [stepStates, shift]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_BPM, bpm);
    setStorageItem(STORAGE_KEY_BEATS, beatsPerMeasure);
    setStorageItem(STORAGE_KEY_STEP_STATES, stepStates);
    setStorageItem(STORAGE_KEY_SUBDIV_VAL, subdivision);
    setStorageItem(STORAGE_KEY_SWING, swing);
    setStorageItem(STORAGE_KEY_SHIFT, shift);
    setStorageItem(STORAGE_KEY_SOUND, soundPreset);
    setStorageItem(STORAGE_KEY_SAVED_BPMS, savedBpms);
    setStorageItem(STORAGE_KEY_SPEED_TRAINER, speedTrainer);
    setStorageItem(STORAGE_KEY_INTERVAL_TRAINER, intervalTrainer);
    setStorageItem(STORAGE_KEY_PRESETS, presets);
    setStorageItem(STORAGE_KEY_LANGUAGE, language);
    setStorageItem(STORAGE_KEY_THEME, theme);

    // SEO: Sync URL with language
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== language) {
        url.searchParams.set("lang", language);
        window.history.replaceState({}, "", url);
      }
    }
  }, [
    bpm,
    beatsPerMeasure,
    stepStates,
    subdivision,
    swing,
    shift,
    soundPreset,
    savedBpms,
    speedTrainer,
    intervalTrainer,
    presets,
    language,
    theme,
  ]);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;
    const faviconMap: Record<string, string> = {
      glass: `${baseUrl}favicons/favicon-glass.svg`,
      zen: `${baseUrl}favicons/favicon-zen.svg`,
      swiss: `${baseUrl}favicons/favicon-swiss.svg`,
      kids: `${baseUrl}favicons/favicon-kids.svg`,
      cyberpunk: `${baseUrl}favicons/favicon-cyberpunk.svg`,
      "e-ink": `${baseUrl}favicons/favicon-eink.svg`,
    };

    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = faviconMap[theme] || faviconMap.glass;
    } else {
      // Fallback if no favicon link exists
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconMap[theme] || faviconMap.glass;
      document.head.appendChild(newLink);
    }
  }, [theme]);

  const toggleStepState = (i: number) =>
    setStepStates((p) => {
      const n = [...p];
      const current = n[i] ?? BEAT_NORMAL;
      let next: number;
      if (current === BEAT_MUTE) next = BEAT_NORMAL;
      else if (current === BEAT_NORMAL) next = BEAT_SUB_ACCENT;
      else if (current === BEAT_SUB_ACCENT) next = BEAT_ACCENT;
      else next = BEAT_MUTE;

      n[i] = next;
      return n;
    });

  const handleMeasureComplete = (measure: number) => {
    if (!speedTrainer.enabled) return;
    if (bpm >= speedTrainer.targetBpm) return;

    if (measure > 0 && measure % speedTrainer.everyMeasures === 0) {
      const newBpm = Math.min(bpm + speedTrainer.increment, speedTrainer.targetBpm, MAX_BPM);
      setBpm(newBpm);
    }
  };

  const { isPlaying, setIsPlaying, visualBeat, ensureAudioContext, measureCount, isMeasureMuted } =
    useMetronome(bpm, beatsPerMeasure, subdivision, soundPreset, stepStates, {
      swing,
      shift,
      intervalTrainer: intervalTrainer,
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

  const themeOrder: Theme[] = [
    "glass",
    "swiss",
    "zen",
    "e-ink",
    "cyberpunk",
    "kids",
    "neumorphism",
    "amoled",
    "retro",
  ];

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = themeOrder.indexOf(prev);
      const nextIdx = (idx + 1) % themeOrder.length;
      return themeOrder[nextIdx];
    });
  };

  const getSoundDisplay = (val: string) => {
    const opt = soundOptions.find((o) => o.value === val);
    return opt ? opt.label : "SINE";
  };

  const handleSavePreset = (name: string) => {
    const newPreset: Preset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      bpm,
      beatsPerMeasure,
      subdivision,
      soundPreset,
      stepStates: [...stepStates],
      swing,
      shift,
      createdAt: Date.now(),
    };
    setPresets((prev) => [newPreset, ...prev]);
  };

  const handleLoadPreset = (preset: Preset) => {
    setBpm(preset.bpm);
    setBeatsPerMeasure(preset.beatsPerMeasure);
    setSubdivision(preset.subdivision);
    setSoundPreset(preset.soundPreset);
    if (preset.swing !== undefined) setSwing(preset.swing);
    if (preset.shift !== undefined) setShift(preset.shift);
    setTimeout(() => setStepStates(preset.stepStates), 0);
    setShowPresetsModal(false);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <HelmetProvider>
      <SEO language={language} />
      <div className={clsx(styles.app, `theme-${theme}`)}>
        {/* SEO: Hidden H1 for semantics */}
        <h1
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {language === "zh"
            ? "Vibe Metronome 随变节拍器 - 专业在线节拍与节奏训练工具"
            : "Vibe Metronome - Professional Online Rhythm Trainer"}
        </h1>

        <div className={styles["header-buttons"]}>
        <button
          onClick={cycleTheme}
          className={styles["header-btn"]}
          title={translations.dock.theme[language]}
        >
          <Palette size={20} />
        </button>
        <CustomGlassSelect
          icon={Shirt}
          value={theme}
          onChange={setTheme}
          options={[
            { label: translations.options.themes.glass[language], value: "glass" },
            { label: translations.options.themes.swiss[language], value: "swiss" },
            { label: translations.options.themes.zen[language], value: "zen" },
            { label: translations.options.themes["e-ink"][language], value: "e-ink" },
            { label: translations.options.themes.cyberpunk[language], value: "cyberpunk" },
            { label: translations.options.themes.kids[language], value: "kids" },
            { label: translations.options.themes.neumorphism[language], value: "neumorphism" },
            { label: translations.options.themes.amoled[language], value: "amoled" },
            { label: translations.options.themes.retro[language], value: "retro" },
          ]}
          title={translations.dock.theme[language]}
          displayLabel={translations.options.themes[theme][language]}
          alignment="right"
          placement="bottom"
        />
        
          <CustomGlassSelect
            icon={Globe}
            title={translations.header.language[language]}
            value={language}
            options={languages}
            onChange={(val) => setLanguage(val as Language)}
            displayLabel={language.toUpperCase()}
            placement="bottom"
            alignment="right"
          />
        
        <button onClick={() => setIsHelpOpen(true)} className={styles["header-btn"]}>
          <HelpCircle size={20} />
        </button>
      </div>
      <AnimatePresence>
        {isHelpOpen && (
          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} language={language} />
        )}
      </AnimatePresence>

      <div className={styles["app__bg-gradient"]} />

      <div className={styles["app__content"]}>
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

        <div className={styles["visualizer-section"]}>
          <Visualizer
            activeBeat={visualBeat}
            beatsPerMeasure={beatsPerMeasure}
            subdivision={subdivision}
            stepStates={stepStates}
            toggleStepState={toggleStepState}
            shift={shift}
            onShiftChange={setShift}
            language={language}
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

        <div className={styles["dock-section"]}>
          <TrainerDock
            speedTrainer={speedTrainer}
            intervalTrainer={intervalTrainer}
            swing={swing}
            onSpeedClick={() => setShowSpeedModal(true)}
            onIntervalClick={() => setShowIntervalModal(true)}
            onSwingClick={() => setShowSwingModal(true)}
            onPresetsClick={() => setShowPresetsModal(true)}
            language={language}
          />

          <LiquidGlassDock>
            <CustomGlassSelect
              icon={Music2}
              value={beatsPerMeasure}
              onChange={(v) => setBeatsPerMeasure(parseInt(v))}
              options={beatOptions}
              title={translations.dock.timeSignature[language]}
              displayLabel={`${beatsPerMeasure}/4`}
              alignment="left"
            />

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
        {showIntervalModal && (
          <IntervalTrainerModal
            config={intervalTrainer}
            onConfigChange={setIntervalTrainer}
            onClose={() => setShowIntervalModal(false)}
            measureCount={measureCount}
            isMuted={isMeasureMuted}
            language={language}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwingModal && (
          <SwingSettingModal
            swing={swing}
            onSwingChange={setSwing}
            onClose={() => setShowSwingModal(false)}
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
    </HelmetProvider>
  );
}
