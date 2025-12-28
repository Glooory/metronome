import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Music2, Pause, Play, Waves } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './App.module.css';

// Import Components
import { BpmDisplay } from './components/BpmDisplay';
import { BpmHistoryBar } from './components/BpmHistoryBar';
import { CustomGlassSelect } from './components/CustomGlassSelect';
import { HelpModal } from './components/HelpModal';
import { LiquidGlassDock } from './components/LiquidGlassDock';
import { Visualizer } from './components/Visualizer';

// Import Hooks and Constants
import {
  BEAT_ACCENT,
  BEAT_MUTE,
  BEAT_NORMAL,
  BEAT_SUB_ACCENT,
  MAX_BPM,
  MIN_BPM,
  SOUND_DRUM, SOUND_MECH,
  SOUND_SINE, SOUND_WOOD,
  STORAGE_KEY_BEATS,
  STORAGE_KEY_BPM,
  STORAGE_KEY_SAVED_BPMS,
  STORAGE_KEY_SOUND,
  STORAGE_KEY_SUBDIV_VAL,
  TAP_TIMEOUT
} from './constants';
import { useMetronome } from './hooks/useMetronome';

// --- Helper: Safe LocalStorage Access (Typed) ---
function getStorageItem<T>(key: string, defaultValue: T, parser: ((val: string) => T) | null = null): T {
  if (typeof window === 'undefined') return defaultValue;
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
  if (typeof window === 'undefined') return;
  try {
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, valueToStore);
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
};

// --- Main Application ---

export default function MetronomeApp() {
  const [bpm, setBpm] = useState<number>(() => getStorageItem(STORAGE_KEY_BPM, 120, (v) => Math.min(Math.max(parseInt(v, 10), MIN_BPM), MAX_BPM)));
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(() => getStorageItem(STORAGE_KEY_BEATS, 4, (v) => Math.max(parseInt(v, 10), 1)));
  const [subdivision, setSubdivision] = useState<number>(() => getStorageItem(STORAGE_KEY_SUBDIV_VAL, 1, (v) => parseInt(v, 10)));
  const [soundPreset, setSoundPreset] = useState<string>(() => getStorageItem(STORAGE_KEY_SOUND, SOUND_SINE));
  const [savedBpms, setSavedBpms] = useState<number[]>(() => getStorageItem(STORAGE_KEY_SAVED_BPMS, [], JSON.parse));
  
  // Unified Step States: Stores the state (Accent, Sub, Normal, Mute) for every tick
  // Length = beatsPerMeasure * subdivision
  const [stepStates, setStepStates] = useState<number[]>(() => {
    // Initial default: 4/4, subdiv 1. 
    // Default pattern: Accent, Normal, Normal, Normal
    return [BEAT_ACCENT, BEAT_NORMAL, BEAT_NORMAL, BEAT_NORMAL];
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Helper to create a default beat chunk (Main + Subdivisions)
  const createDefaultBeat = (subdivs: number, visualIndex: number) => {
    const chunk = [];
    // First tick is main beat (Accent on 1, Normal on others)
    chunk.push(visualIndex === 0 ? BEAT_ACCENT : BEAT_NORMAL);
    // Remaining ticks are Normal
    for (let i = 1; i < subdivs; i++) {
        chunk.push(BEAT_NORMAL);
    }
    return chunk;
  };

  // Effect: Handle BeatsPerMeasure or Subdivision changes
  // We try to preserve existing patterns where possible
  useEffect(() => {
    setStepStates(prev => {
        const currentTotal = prev.length;
        const targetTotal = beatsPerMeasure * subdivision;
        
        // If exact match (unlikely if inputs changed, but possible on init loops), do nothing
        if (currentTotal === targetTotal) return prev;

        // Reconstruct visual beats
        // We need to know previous subdivision to map correctly
        // But we don't store "prevSubdivision" here easily without ref. 
        // Strategy: 
        // 1. If length matches logic (prev.length % subdiv == 0?), try to reshape.
        // 2. Simplification: Just regenerate from scratch if subdivision changes? 
        //    User might lose data, but it's cleaner. 
        //    Let's try to be smart: Assume previous state was valid for *current* beats/subdiv? No.
        
        // Let's rely on a simpler macro logic: 
        // Just Reset to Defaults when structure changes. 
        // Providing "smart resize" for complex rhythmic patterns is hard without history.
        // ACTUALLY: The user Experience is better if we just reset to standard metronome pattern 
        // (Accent on 1) when structure changes.
        
        const newSteps: number[] = [];
        for (let b = 0; b < beatsPerMeasure; b++) {
            newSteps.push(...createDefaultBeat(subdivision, b));
        }
        return newSteps;
    });
  }, [beatsPerMeasure, subdivision]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_BPM, bpm);
    setStorageItem(STORAGE_KEY_BEATS, beatsPerMeasure);
    // Not storing stepStates just yet to avoid complexity or adding new key? 
    // User probably wants persistence. Let's add STORAGE_KEY_STEPS later or reuse STATES key.
    // For now, let's skip persistence of complex patterns to avoid conflicts with old data.
    setStorageItem(STORAGE_KEY_SUBDIV_VAL, subdivision);
    setStorageItem(STORAGE_KEY_SOUND, soundPreset);
    setStorageItem(STORAGE_KEY_SAVED_BPMS, savedBpms);
  }, [bpm, beatsPerMeasure, stepStates, subdivision, soundPreset, savedBpms]);

  const toggleStepState = (i: number) => setStepStates(p => { 
    const n = [...p]; 
    const current = n[i] ?? BEAT_NORMAL;
    let next: number;
    // Cycle: Accent(1) -> SubAccent(3) -> Normal(0) -> Mute(2) -> Accent(1)
    if (current === BEAT_ACCENT) next = BEAT_SUB_ACCENT;
    else if (current === BEAT_SUB_ACCENT) next = BEAT_NORMAL;
    else if (current === BEAT_NORMAL) next = BEAT_MUTE;
    else next = BEAT_ACCENT;
    
    n[i] = next; 
    return n; 
  });

  const { isPlaying, setIsPlaying, visualBeat, ensureAudioContext } = useMetronome(bpm, beatsPerMeasure, subdivision, soundPreset, stepStates);
  
  const tapTimes = useRef<number[]>([]);
  const handleTap = () => {
    ensureAudioContext(); 
    const now = Date.now();
    if (tapTimes.current.length > 0 && now - tapTimes.current[tapTimes.current.length - 1] > TAP_TIMEOUT) {
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
      if ((e.target as HTMLElement).tagName === 'INPUT') return; 
      const step = e.shiftKey ? 5 : 1;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); } 
      else if (e.code === 'ArrowUp') { e.preventDefault(); setBpm(b => Math.min(b + step, MAX_BPM)); }
      else if (e.code === 'ArrowDown') { e.preventDefault(); setBpm(b => Math.max(b - step, MIN_BPM)); }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying]);

  // --- Configuration Options ---
  const beatOptions = [2,3,4,5,6].map(b => ({ label: `${b}/4`, value: b }));
  const soundOptions = [
    { label: 'SINE', value: SOUND_SINE },
    { label: 'WOOD', value: SOUND_WOOD },
    { label: 'DRUM', value: SOUND_DRUM },
    { label: 'MECH', value: SOUND_MECH },
  ];
  const subdivOptions = [
    { label: 'QTR (1/4)', value: 1 },
    { label: '8TH (1/8)', value: 2 },
    { label: 'TRIP (1/3)', value: 3 },
    { label: '16TH (1/16)', value: 4 },
  ];


  const getSoundDisplay = (val: string) => {
    const opt = soundOptions.find(o => o.value === val);
    return opt ? opt.label : 'SINE';
  };

  return (
    <div className={styles.app}>
      {/* HELP */}
      <div className={styles['help-modal__trigger-wrapper']}>
        <button onClick={() => setIsHelpOpen(true)} className={styles['help-modal__trigger-btn']}><HelpCircle size={20} /></button>
      </div>
      <AnimatePresence>{isHelpOpen && <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />}</AnimatePresence>

      {/* BACKGROUND */}
      <div className={clsx(styles['app__bg-overlay'], styles['app__bg-gradient--primary'])} />
      <div className={clsx(styles['app__bg-overlay'], styles['app__bg-gradient--secondary'])} />
      <div className={styles['app__blob--1']} />
      <div className={styles['app__blob--2']} />
      <div className={styles['app__blob--3']} />
      <div className={styles['app__noise-overlay']} />

      {/* MAIN CONTAINER: CENTERED LAYOUT WITH UNIFIED SPACING */}
      <div className={styles['app__content']}>
          
          {/* BLOCK 1: BPM & HISTORY */}
          <div className={styles['bpm-section']}>
              <BpmDisplay bpm={bpm} setBpm={setBpm} />
              <BpmHistoryBar currentBpm={bpm} setBpm={setBpm} savedBpms={savedBpms} setSavedBpms={setSavedBpms} onTap={handleTap} />
          </div>

          {/* BLOCK 2: VISUALIZER */}
          <div className={styles['visualizer-section']}>
            <Visualizer 
                activeBeat={visualBeat} 
                beatsPerMeasure={beatsPerMeasure} 
                subdivision={subdivision}
                stepStates={stepStates}
                toggleStepState={toggleStepState}
            />
            <div className={styles['subdivision-row']}>
              {subdivOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={clsx(styles['subdivision-btn'], subdivision === opt.value && styles['subdivision-btn--active'])}
                  onClick={() => setSubdivision(opt.value)}
                >
                  {opt.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* BLOCK 3: DOCK */}
          <div className={styles['dock-section']}>
            <LiquidGlassDock>
                
                {/* 1. Time Signature Select (Left) */}
                <CustomGlassSelect 
                  icon={Music2} 
                  value={beatsPerMeasure} 
                  onChange={(v) => setBeatsPerMeasure(parseInt(v))}
                  options={beatOptions}
                  title="拍号"
                  displayLabel={`${beatsPerMeasure}/4`}
                  alignment="left"
                />

                {/* 2. Play (Center) */}
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className={clsx(styles['play-btn'], isPlaying ? styles['play-btn--playing'] : styles['play-btn--stopped'])}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className={styles['play-btn__icon-play']} />}
                </motion.button>
                
                {/* 3. Sound Preset Select (Right) */}
                <CustomGlassSelect 
                  icon={Waves} 
                  value={soundPreset} 
                  onChange={setSoundPreset}
                  options={soundOptions}
                  title="音色"
                  displayLabel={getSoundDisplay(soundPreset)}
                  alignment="right"
                />
            </LiquidGlassDock>
          </div>
      </div>
    </div>
  );
}
