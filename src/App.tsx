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
  STORAGE_KEY_STEP_STATES,
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

export default function MetronomeApp() {
  const [bpm, setBpm] = useState<number>(() => getStorageItem(STORAGE_KEY_BPM, 120, (v) => Math.min(Math.max(parseInt(v, 10), MIN_BPM), MAX_BPM)));
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(() => getStorageItem(STORAGE_KEY_BEATS, 4, (v) => Math.max(parseInt(v, 10), 1)));
  const [subdivision, setSubdivision] = useState<number>(() => getStorageItem(STORAGE_KEY_SUBDIV_VAL, 1, (v) => parseInt(v, 10)));
  const [soundPreset, setSoundPreset] = useState<string>(() => getStorageItem(STORAGE_KEY_SOUND, SOUND_SINE));
  const [savedBpms, setSavedBpms] = useState<number[]>(() => getStorageItem(STORAGE_KEY_SAVED_BPMS, [], JSON.parse));
  
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

  // ... (Effect for resizing stepStates on config change - same as before) ...
  useEffect(() => {
    setStepStates(prev => {
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
    setStorageItem(STORAGE_KEY_STEP_STATES, stepStates); // Now persisting steps!
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
      <div className={styles['app__bg-gradient']} />
      {/* Optional: Keeping noise overlay for texture if it's lightweight enough, usually is */}
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
