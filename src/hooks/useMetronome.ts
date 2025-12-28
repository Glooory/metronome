import { useCallback, useEffect, useRef, useState } from 'react';

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
  SOUND_WOOD
} from '../constants';

interface Note {
    note: number;
    time: number;
}

export const useMetronome = (
    bpm: number, 
    beatsPerMeasure: number, 
    subdivision: number, 
    soundPreset: string,
    stepStates: number[]
) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (audioContext.current.state === 'suspended') {
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
  const playSine = (ctx: AudioContext, time: number, beatType: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    osc.type = 'sine';
    
    // Tighter, cleaner sine beep
    let freq = 880; 
    let peakGain = 0.7;
    let decay = 0.1;

    if (beatType === BEAT_ACCENT) { freq = 1760; peakGain = 0.9; decay = 0.15; } // High ping
    else if (beatType === BEAT_SUB_ACCENT) { freq = 1320; peakGain = 0.8; decay = 0.12; }
    
    osc.frequency.value = freq;
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.005); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
    
    osc.start(time);
    osc.stop(time + decay + 0.05);
  };

  const playWoodblock = (ctx: AudioContext, time: number, beatType: number) => {
    // Dual oscillator for hollow sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    // High pitched, resonant
    let baseFreq = 800;
    let gain = 0.7;
    
    if (beatType === BEAT_ACCENT) { baseFreq = 1600; gain = 0.9; }
    else if (beatType === BEAT_SUB_ACCENT) { baseFreq = 1200; gain = 0.8; }

    osc1.frequency.setValueAtTime(baseFreq, time);
    osc1.type = 'sine';
    
    // Slight detune for resonance
    osc2.frequency.setValueAtTime(baseFreq * 1.58, time); // Inharmonic ratio
    osc2.type = 'square'; // Adds harmonics, filtered by low decay

    // Filter for osc2 to not be too buzzing
    // Actually simplicity is better: just sine waves
    osc2.type = 'sine';

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(gain, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08); // Short decay

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.1);
    osc2.stop(time + 0.1);
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
        noiseFilter.type = 'highpass';
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
        osc.type = 'triangle';
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
        filter.type = 'highpass';
        filter.frequency.value = 8000;
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

  const playMech = (ctx: AudioContext, time: number, beatType: number) => {
    // Mechanical Click (Broadband impulse)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    osc.type = 'square';
    
    let freq = 2000; // Sharp click
    let gain = 0.5;
    
    if (beatType === BEAT_ACCENT) { freq = 2500; gain = 0.7; }
    else if (beatType === BEAT_SUB_ACCENT) { freq = 2200; gain = 0.6; }

    osc.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(gain, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.03); // Ultra short
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  // Use Ref for stepStates to avoid re-triggering scheduler effect on state change
  const stepStatesRef = useRef(stepStates);

  useEffect(() => {
    stepStatesRef.current = stepStates;
  }, [stepStates]);

  // ... (existing code) ...

  const playSound = useCallback((time: number, beatNumber: number) => {
    if (!audioContext.current) return;
    
    // Read from Ref to ensure stability without dependency update
    const currentStepStates = stepStatesRef.current;
    const totalSteps = currentStepStates.length; 
    
    if (totalSteps === 0) return;

    const currentStepIndex = beatNumber % totalSteps;
    const beatType = currentStepStates[currentStepIndex];

    if (beatType === BEAT_MUTE) return;

    switch(soundPreset) {
        case SOUND_WOOD: playWoodblock(audioContext.current, time, beatType); break;
        case SOUND_DRUM: playDrum(audioContext.current, time, beatType); break;
        case SOUND_MECH: playMech(audioContext.current, time, beatType); break;
        case SOUND_SINE: default: playSine(audioContext.current, time, beatType); break;
    }
  }, [soundPreset]); // stepStates removed from dependency

  const nextNote = useCallback(() => {
    // Safety check to prevent infinite loop
    const safeSubdivision = Math.max(1, subdivision || 1);
    const safeBpm = Math.max(1, bpm || 120);
    const secondsPerSubdivision = 60.0 / safeBpm / safeSubdivision;
    nextNoteTime.current += secondsPerSubdivision;
  }, [bpm, subdivision]);

  const scheduleNote = useCallback((beatCounter: number, time: number) => {
    notesInQueue.current.push({ note: beatCounter, time: time });
    playSound(time, beatCounter); // Fixed: Removed 3rd argument
  }, [playSound]);

  const scheduler = useCallback(() => {
    if (!audioContext.current) return;
    
    // Failsafe: Prevent infinite loop if audio time logic fails
    let loops = 0;
    while (nextNoteTime.current < audioContext.current.currentTime + SCHEDULE_AHEAD_TIME && loops < 100) {
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
      scheduler();
    } else {
      if (timerID.current) window.clearTimeout(timerID.current);
    }
    return () => { if (timerID.current) window.clearTimeout(timerID.current); };
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
      while (notesInQueue.current.length && notesInQueue.current[0].time < currentTime) {
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

  return { isPlaying, setIsPlaying, visualBeat, ensureAudioContext };
};
