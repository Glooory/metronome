import { useCallback, useEffect, useRef, useState } from "react";

// --- Constants (Shared or moved here if specific to hook, but let's keep shared constants in a separate file if needed. For now, I'll duplicate or move them. Actually, let's look at App.tsx again. The constants are used in App.tsx too. I should probably create a constants file.)
// Wait, for now I will put constants used by the hook inside the hook file or just keep them duplicated if small.
// BEAT_* constants are used in App.tsx for visualizer state.
// SOUND_* constants are used in App.tsx for select options.
// Let's create a types/constants file first?
// Or just put everything in the hook for now?
// The prompt says "Modularize".
// Let's create src/constants.ts for constants.

import {
  BEAT_ACCENT,
  BEAT_MUTE,
  BEAT_SUB_ACCENT,
  LOOKAHEAD,
  SCHEDULE_AHEAD_TIME,
  SOUND_DRUM,
  SOUND_MECH,
  SOUND_SINE,
  SOUND_WOOD,
  type RhythmTrainerConfig,
} from "../constants";

interface Note {
  note: number;
  time: number;
}

interface UseMetronomeOptions {
  rhythmTrainer?: RhythmTrainerConfig;
  onMeasureComplete?: (measureCount: number) => void;
}

export const useMetronome = (
  bpm: number,
  beatsPerMeasure: number,
  subdivision: number,
  soundPreset: string,
  stepStates: number[],
  options: UseMetronomeOptions = {}
) => {
  // Store options in refs for stable access in callbacks
  const rhythmTrainerRef = useRef(options.rhythmTrainer);
  const onMeasureCompleteRef = useRef(options.onMeasureComplete);

  useEffect(() => {
    rhythmTrainerRef.current = options.rhythmTrainer;
    onMeasureCompleteRef.current = options.onMeasureComplete;
  }, [options.rhythmTrainer, options.onMeasureComplete]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [measureCount, setMeasureCount] = useState(0);
  const lastMeasureRef = useRef(-1); // Track last processed measure to avoid duplicates
  const audioContext = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef(0.0);
  const timerID = useRef<number | null>(null);
  const notesInQueue = useRef<Note[]>([]);

  /* --- Reverb Helper --- */
  const buildImpulseResponse = (ctx: AudioContext) => {
    const rate = ctx.sampleRate;
    const length = rate * 1.5; // 1.5s decay
    const decay = 2.0;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  };

  // Function property to track beat counter in scheduler
  const schedulerRef = useRef<{ beatCounter: number }>({ beatCounter: 0 });

  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);

  const ensureAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === "suspended") {
      audioContext.current.resume();
    }

    if (!convolverRef.current && audioContext.current) {
      const ctx = audioContext.current;
      const conv = ctx.createConvolver();
      const wet = ctx.createGain();
      wet.gain.value = 0.3;

      conv.buffer = buildImpulseResponse(ctx);
      conv.connect(wet);
      wet.connect(ctx.destination);

      convolverRef.current = conv;
      wetGainNodeRef.current = wet;
    }
  };

  // --- Sound Synthesis Functions ---
  // --- Sound Utils ---
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getNoiseBuffer = (ctx: AudioContext) => {
    if (!noiseBufferRef.current) {
      const bufferSize = ctx.sampleRate * 2.0; // 2 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    return noiseBufferRef.current;
  };

  // --- Sound Synthesis Functions ---
  // Digital / Beep Style (研究报告 3.1)
  // Square wave + lowpass filter, Casio-style digital beep
  const playSine = (ctx: AudioContext, time: number, beatType: number) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    osc.type = "square"; // Square wave for penetrating digital sound
    filter.type = "lowpass";

    // Octave relationship: A6 (accent) / A5 (weak) - clear pitch distinction
    let freq = 880; // A5 base
    let filterFreq = 3000;
    let peakGain = 0.4; // -8dB for weak beat
    let decay = 0.05;

    if (beatType === BEAT_ACCENT) {
      freq = 1760; // A6 - one octave higher
      filterFreq = 4000; // Brighter filter
      peakGain = 1.0; // 0dB
      decay = 0.1; // Longer decay
    } else if (beatType === BEAT_SUB_ACCENT) {
      freq = 1320; // E6
      filterFreq = 3500;
      peakGain = 0.7; // -3dB
      decay = 0.08;
    }

    osc.frequency.value = freq;
    filter.frequency.value = filterFreq;

    // Fast attack, exponential decay (capacitor discharge simulation)
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.start(time);
    osc.stop(time + decay + 0.05);
  };

  // Woodblock / Clave - FM Synthesis (研究报告 3.3)
  // Non-harmonic C:M ratio 1:1.5 produces hollow wood/metal timbre
  const playWoodblock = (ctx: AudioContext, time: number, beatType: number) => {
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const masterGain = ctx.createGain();

    // FM chain: Modulator -> ModGain -> Carrier.frequency
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(masterGain);
    masterGain.connect(ctx.destination);
    if (convolverRef.current) masterGain.connect(convolverRef.current);

    // Beat hierarchy parameters
    let carrierFreq = 800;
    let modIndex = 300; // Modulation depth
    let peakGain = 1.2; // -8dB
    let decay = 0.05;

    if (beatType === BEAT_ACCENT) {
      carrierFreq = 1000;
      modIndex = 500; // More harmonics on accent
      peakGain = 3; // 0dB
      decay = 0.15;
    } else if (beatType === BEAT_SUB_ACCENT) {
      carrierFreq = 900;
      modIndex = 400;
      peakGain = 2.1; // -3dB
      decay = 0.1;
    }

    // FM parameters: C:M ratio = 1:1.5 (golden ratio for wood timbre)
    carrier.frequency.value = carrierFreq;
    modulator.frequency.value = carrierFreq * 1.5;

    // Modulation index envelope: rapid decay simulates transient harmonic burst
    modGain.gain.setValueAtTime(modIndex, time);
    modGain.gain.exponentialRampToValueAtTime(1, time + 0.05);

    // Master envelope: ultra-fast attack, exponential decay
    masterGain.gain.setValueAtTime(0, time);
    masterGain.gain.linearRampToValueAtTime(peakGain, time + 0.002);
    masterGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    carrier.start(time);
    modulator.start(time);
    carrier.stop(time + decay + 0.05);
    modulator.stop(time + decay + 0.05);
  };

  const playDrum = (ctx: AudioContext, time: number, beatType: number) => {
    // "动次打" Style

    if (beatType === BEAT_ACCENT) {
      // --- KICK (动) ---
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (convolverRef.current) gainNode.connect(convolverRef.current);

      // Punchy sweep: 180Hz -> 50Hz very fast
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

      // Envelope with click
      // Increased gain to 1.5 and decay for more punch
      gainNode.gain.setValueAtTime(1.5, time);
      gainNode.gain.linearRampToValueAtTime(1.5, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

      osc.start(time);
      osc.stop(time + 0.3);
    } else if (beatType === BEAT_SUB_ACCENT) {
      // --- SNARE/CLAP (次) ---
      // 1. Noise Snap
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 1000;
      const noiseGain = ctx.createGain();

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      if (convolverRef.current) noiseGain.connect(convolverRef.current);

      noiseGain.gain.setValueAtTime(0, time);
      noiseGain.gain.linearRampToValueAtTime(0.8, time + 0.005);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      noise.start(time);
      noise.stop(time + 0.2);

      // 2. Body Tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.frequency.setValueAtTime(250, time);
      osc.type = "triangle";
      oscGain.gain.setValueAtTime(0, time);
      oscGain.gain.linearRampToValueAtTime(0.3, time + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.15);
    } else {
      // --- HI-HAT (打) ---
      // High frequency noise burst
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 9000; // Higher for more shimmer
      const gainNode = ctx.createGain();

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (convolverRef.current) gainNode.connect(convolverRef.current);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05); // Very short

      noise.start(time);
      noise.stop(time + 0.1);
    }
  };

  // Mechanical Click - Noise-based Bandpass (研究报告 3.2)
  // White noise burst through bandpass filter simulates Wittner wood box resonance
  const playMech = (ctx: AudioContext, time: number, beatType: number) => {
    // Noise source for broadband impact
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    filter.type = "bandpass";

    // Beat hierarchy: vary resonant frequency and Q
    let centerFreq = 1500;
    let q = 5.0; // High Q for "wooden" character
    let peakGain = 4; // Boosted x2 again (was 1.2)
    let decay = 0.03; // Ultra-short for dry click

    if (beatType === BEAT_ACCENT) {
      centerFreq = 2000; // Higher, brighter click
      q = 4.0; // Slightly wider
      peakGain = 10; // Boosted (was 2.5)
      decay = 0.05;
    } else if (beatType === BEAT_SUB_ACCENT) {
      centerFreq = 1800;
      q = 4.5;
      peakGain = 7; // Boosted (was 1.8)
      decay = 0.04;
    }

    filter.frequency.value = centerFreq;
    filter.Q.value = q;

    // Instant attack, very fast exponential decay (dry mechanical impact)
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + decay);

    noise.start(time);
    noise.stop(time + decay + 0.02);
  };

  // Use Ref for stepStates to avoid re-triggering scheduler effect on state change
  const stepStatesRef = useRef(stepStates);

  useEffect(() => {
    stepStatesRef.current = stepStates;
  }, [stepStates]);

  // ... (existing code) ...

  // Helper to check if current measure should be muted (Rhythm Trainer)
  const isMeasureMuted = useCallback((currentMeasure: number): boolean => {
    const rt = rhythmTrainerRef.current;
    if (!rt || !rt.enabled) return false;

    const cycleLength = rt.playBars + rt.muteBars;
    const positionInCycle = currentMeasure % cycleLength;
    return positionInCycle >= rt.playBars; // Muted if past play bars
  }, []);

  const playSound = useCallback(
    (time: number, beatNumber: number, currentMeasure: number) => {
      if (!audioContext.current) return;

      // Read from Ref to ensure stability without dependency update
      const currentStepStates = stepStatesRef.current;
      const totalSteps = currentStepStates.length;

      if (totalSteps === 0) return;

      const currentStepIndex = beatNumber % totalSteps;
      const beatType = currentStepStates[currentStepIndex];

      if (beatType === BEAT_MUTE) return;

      // Rhythm Trainer: Skip audio if in muted phase
      if (isMeasureMuted(currentMeasure)) return;

      switch (soundPreset) {
        case SOUND_WOOD:
          playWoodblock(audioContext.current, time, beatType);
          break;
        case SOUND_DRUM:
          playDrum(audioContext.current, time, beatType);
          break;
        case SOUND_MECH:
          playMech(audioContext.current, time, beatType);
          break;
        case SOUND_SINE:
        default:
          playSine(audioContext.current, time, beatType);
          break;
      }
    },
    [soundPreset, isMeasureMuted]
  );

  const nextNote = useCallback(() => {
    // Safety check to prevent infinite loop
    const safeSubdivision = Math.max(1, subdivision || 1);
    const safeBpm = Math.max(1, bpm || 120);
    const secondsPerSubdivision = 60.0 / safeBpm / safeSubdivision;
    nextNoteTime.current += secondsPerSubdivision;
  }, [bpm, subdivision]);

  // Calculate current measure from beat counter
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const subdivisionRef = useRef(subdivision);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
    subdivisionRef.current = subdivision;
  }, [beatsPerMeasure, subdivision]);

  const scheduleNote = useCallback(
    (beatCounter: number, time: number) => {
      const stepsPerMeasure = beatsPerMeasureRef.current * subdivisionRef.current;
      const currentMeasure = Math.floor(beatCounter / stepsPerMeasure);

      notesInQueue.current.push({ note: beatCounter, time: time });
      playSound(time, beatCounter, currentMeasure);

      // Track measure completion (fire once per new measure)
      if (currentMeasure > lastMeasureRef.current) {
        lastMeasureRef.current = currentMeasure;
        setMeasureCount(currentMeasure);

        // Fire callback for speed trainer etc.
        if (onMeasureCompleteRef.current) {
          onMeasureCompleteRef.current(currentMeasure);
        }
      }
    },
    [playSound]
  );

  const scheduler = useCallback(() => {
    if (!audioContext.current) return;

    // Failsafe: Prevent infinite loop if audio time logic fails
    let loops = 0;
    while (
      nextNoteTime.current < audioContext.current.currentTime + SCHEDULE_AHEAD_TIME &&
      loops < 100
    ) {
      scheduleNote(schedulerRef.current.beatCounter, nextNoteTime.current);
      nextNote();
      schedulerRef.current.beatCounter++;
      loops++;
    }

    timerID.current = window.setTimeout(scheduler, LOOKAHEAD);
  }, [nextNote, scheduleNote]);

  // Main Playback Effect
  useEffect(() => {
    if (isPlaying) {
      ensureAudioContext();
      if (audioContext.current) {
        nextNoteTime.current = audioContext.current.currentTime + 0.05;
      }
      schedulerRef.current.beatCounter = 0;
      lastMeasureRef.current = -1; // Reset measure tracking
      setMeasureCount(0);
      scheduler();
    } else {
      if (timerID.current) window.clearTimeout(timerID.current);
    }
    return () => {
      if (timerID.current) window.clearTimeout(timerID.current);
    };
  }, [isPlaying, scheduler]); // Now scheduler is stable when stepStates changes

  const [visualBeat, setVisualBeat] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setVisualBeat(null);
      return;
    }
    let animationFrameId: number;
    const draw = () => {
      const currentTime = audioContext.current?.currentTime || 0;
      // Add small lookahead to compensate for React render cycle latency (~30-50ms)
      // This ensures the visual highlight hits closer to the actual sound
      const VISUAL_OFFSET = 0.05;

      while (
        notesInQueue.current.length &&
        notesInQueue.current[0].time < currentTime + VISUAL_OFFSET
      ) {
        const currentNote = notesInQueue.current[0];

        // Use Ref here too for consistency, though visual doesn't need perfect stability like audio
        const currentStepStates = stepStatesRef.current;
        const totalSteps = currentStepStates.length || 1; // avoid /0
        const currentStep = currentNote.note % totalSteps;

        setVisualBeat(currentStep);
        notesInQueue.current.splice(0, 1);
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, beatsPerMeasure, subdivision]); // removed stepStates from dep, handled via ref reading logic implicitly or perfectly fine if it just syncs to beats

  // Compute current muted state for UI display
  const currentMeasure = measureCount;
  const isCurrentlyMuted = isMeasureMuted(currentMeasure);

  return {
    isPlaying,
    setIsPlaying,
    visualBeat,
    ensureAudioContext,
    measureCount,
    isMeasureMuted: isCurrentlyMuted,
  };
};
