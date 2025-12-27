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
    BEAT_NORMAL,
    LOOKAHEAD,
    SCHEDULE_AHEAD_TIME,
    SOUND_DRUM,
    SOUND_MECH,
    SOUND_SINE,
    SOUND_WOOD
} from '../constants'; // I will create this file next.

interface Note {
    note: number;
    time: number;
}

export const useMetronome = (
    bpm: number, 
    beatsPerMeasure: number, 
    beatStates: number[], 
    subdivision: number, 
    soundPreset: string
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef(0.0);
  const timerID = useRef<number | null>(null);
  const notesInQueue = useRef<Note[]>([]);

  // Function property to track beat counter in scheduler
  const schedulerRef = useRef<{ beatCounter: number }>({ beatCounter: 0 });

  const ensureAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  // --- Sound Synthesis Functions ---
  const playSine = (ctx: AudioContext, time: number, isAccent: boolean, isSubdivision: boolean) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    if (isSubdivision) {
      osc.frequency.value = 800; 
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.35, time + 0.003); 
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);
    } else {
      osc.frequency.value = isAccent ? 1000 : 600;
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(isAccent ? 1.0 : 0.75, time + 0.003); 
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.start(time);
      osc.stop(time + 0.15);
    }
  };

  const playWoodblock = (ctx: AudioContext, time: number, isAccent: boolean, isSubdivision: boolean) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    const freq = isSubdivision ? 1600 : (isAccent ? 1200 : 800);
    osc.frequency.setValueAtTime(freq, time);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(isSubdivision ? 0.4 : (isAccent ? 1.0 : 0.7), time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + (isSubdivision ? 0.05 : 0.1));

    osc.start(time);
    osc.stop(time + 0.12);
  };

  const playDrum = (ctx: AudioContext, time: number, isAccent: boolean, isSubdivision: boolean) => {
    if (isSubdivision) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 8000; 
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.25, time + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.start(time);
      osc.stop(time + 0.04);
    } else {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (isAccent) {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
        gainNode.gain.setValueAtTime(1.0, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      } else {
        osc.frequency.setValueAtTime(400, time);
        osc.type = 'triangle';
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.6, time + 0.003);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      }
      osc.start(time);
      osc.stop(time + 0.2);
    }
  };

  const playMech = (ctx: AudioContext, time: number, isAccent: boolean, isSubdivision: boolean) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'square';
    
    if (isSubdivision) {
      osc.frequency.value = 2000;
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.015); 
      osc.start(time);
      osc.stop(time + 0.02);
    } else {
      osc.frequency.value = isAccent ? 1200 : 800;
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(isAccent ? 0.8 : 0.5, time + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03); 
      osc.start(time);
      osc.stop(time + 0.04);
    }
  };

  const playSound = useCallback((time: number, beatNumber: number, subdivisionIndex: number) => {
    if (!audioContext.current) return;
    
    const isMainBeat = subdivisionIndex === 0;
    const totalSubdivisionsPerMeasure = beatsPerMeasure * subdivision;
    const positionInMeasure = beatNumber % totalSubdivisionsPerMeasure;
    const currentMainBeatIndex = Math.floor(positionInMeasure / subdivision);
    
    const currentState = beatStates[currentMainBeatIndex] ?? BEAT_NORMAL;
    const isAccent = currentState === BEAT_ACCENT;
    const isMute = currentState === BEAT_MUTE;

    if (isMute) return;

    if (isMainBeat) {
      switch(soundPreset) {
        case SOUND_WOOD: playWoodblock(audioContext.current, time, isAccent, false); break;
        case SOUND_DRUM: playDrum(audioContext.current, time, isAccent, false); break;
        case SOUND_MECH: playMech(audioContext.current, time, isAccent, false); break;
        case SOUND_SINE: default: playSine(audioContext.current, time, isAccent, false); break;
      }
    } else {
      switch(soundPreset) {
        case SOUND_WOOD: playWoodblock(audioContext.current, time, isAccent, true); break;
        case SOUND_DRUM: playDrum(audioContext.current, time, isAccent, true); break;
        case SOUND_MECH: playMech(audioContext.current, time, isAccent, true); break;
        case SOUND_SINE: default: playSine(audioContext.current, time, isAccent, true); break;
      }
    }
  }, [beatsPerMeasure, subdivision, beatStates, soundPreset]);

  const nextNote = useCallback(() => {
    const secondsPerSubdivision = 60.0 / bpm / subdivision;
    nextNoteTime.current += secondsPerSubdivision;
  }, [bpm, subdivision]);

  const scheduleNote = useCallback((beatCounter: number, time: number) => {
    notesInQueue.current.push({ note: beatCounter, time: time });
    
    const subdivisionIndex = beatCounter % subdivision;
    playSound(time, beatCounter, subdivisionIndex);
  }, [subdivision, playSound]);

  const scheduler = useCallback(() => {
    if (!audioContext.current) return;
    while (nextNoteTime.current < audioContext.current.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleNote(schedulerRef.current.beatCounter, nextNoteTime.current);
      nextNote();
      schedulerRef.current.beatCounter++;
    }
    timerID.current = window.setTimeout(scheduler, LOOKAHEAD);
  }, [nextNote, scheduleNote]);

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
  }, [isPlaying, scheduler]);

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
        
        const totalSteps = beatsPerMeasure * subdivision;
        const currentStep = currentNote.note % totalSteps;
        
        setVisualBeat(currentStep); 
        notesInQueue.current.splice(0, 1);
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, beatsPerMeasure, beatStates, subdivision]);

  return { isPlaying, setIsPlaying, visualBeat, ensureAudioContext };
};
