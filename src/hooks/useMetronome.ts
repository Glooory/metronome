import { useCallback, useEffect, useRef, useState } from "react";
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
    type IntervalTrainerConfig,
} from "../constants";

interface Note {
  note: number;
  time: number;
}

interface UseMetronomeOptions {
  swing?: number; // 0-100
  shift?: number; // integer
  intervalTrainer?: IntervalTrainerConfig;
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
  const intervalTrainerRef = useRef(options.intervalTrainer);
  const onMeasureCompleteRef = useRef(options.onMeasureComplete);

  useEffect(() => {
    intervalTrainerRef.current = options.intervalTrainer;
    onMeasureCompleteRef.current = options.onMeasureComplete;
  }, [options.intervalTrainer, options.onMeasureComplete]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [measureCount, setMeasureCount] = useState(0);
  const lastMeasureRef = useRef(-1);
  const audioContext = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef(0.0);
  const timerID = useRef<number | null>(null);
  const notesInQueue = useRef<Note[]>([]);

  const buildImpulseResponse = (ctx: AudioContext) => {
    const rate = ctx.sampleRate;
    const length = rate * 1.5;
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

  const swingRef = useRef(options.swing ?? 0);
  const shiftRef = useRef(options.shift ?? 0);

  useEffect(() => {
    intervalTrainerRef.current = options.intervalTrainer;
    onMeasureCompleteRef.current = options.onMeasureComplete;
    swingRef.current = options.swing ?? 0;
    shiftRef.current = options.shift ?? 0;
  }, [options.intervalTrainer, options.onMeasureComplete, options.swing, options.shift]);

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

  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getNoiseBuffer = (ctx: AudioContext) => {
    if (!noiseBufferRef.current) {
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    return noiseBufferRef.current;
  };

  const playSine = (ctx: AudioContext, time: number, beatType: number) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (convolverRef.current) gainNode.connect(convolverRef.current);

    osc.type = "square";
    filter.type = "lowpass";

    let freq = 880;
    let filterFreq = 3000;
    let peakGain = 0.4;
    let decay = 0.05;

    if (beatType === BEAT_ACCENT) {
      freq = 1760;
      filterFreq = 4000;
      peakGain = 1.0;
      decay = 0.1;
    } else if (beatType === BEAT_SUB_ACCENT) {
      freq = 1320;
      filterFreq = 3500;
      peakGain = 0.7;
      decay = 0.08;
    }

    osc.frequency.value = freq;
    filter.frequency.value = filterFreq;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.start(time);
    osc.stop(time + decay + 0.05);
  };

  const playWoodblock = (ctx: AudioContext, time: number, beatType: number) => {
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const masterGain = ctx.createGain();

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(masterGain);
    masterGain.connect(ctx.destination);
    if (convolverRef.current) masterGain.connect(convolverRef.current);

    let carrierFreq = 800;
    let modIndex = 300;
    let peakGain = 1.2;
    let decay = 0.05;

    if (beatType === BEAT_ACCENT) {
      carrierFreq = 1000;
      modIndex = 500;
      peakGain = 3;
      decay = 0.15;
    } else if (beatType === BEAT_SUB_ACCENT) {
      carrierFreq = 900;
      modIndex = 400;
      peakGain = 2.1;
      decay = 0.1;
    }

    carrier.frequency.value = carrierFreq;
    modulator.frequency.value = carrierFreq * 1.5;

    modGain.gain.setValueAtTime(modIndex, time);
    modGain.gain.exponentialRampToValueAtTime(1, time + 0.05);

    masterGain.gain.setValueAtTime(0, time);
    masterGain.gain.linearRampToValueAtTime(peakGain, time + 0.002);
    masterGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    carrier.start(time);
    modulator.start(time);
    carrier.stop(time + decay + 0.05);
    modulator.stop(time + decay + 0.05);
  };

  const playDrum = (ctx: AudioContext, time: number, beatType: number) => {
    if (beatType === BEAT_ACCENT) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (convolverRef.current) gainNode.connect(convolverRef.current);

      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

      gainNode.gain.setValueAtTime(1.5, time);
      gainNode.gain.linearRampToValueAtTime(1.5, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

      osc.start(time);
      osc.stop(time + 0.3);
    } else if (beatType === BEAT_SUB_ACCENT) {
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
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 9000;
      const gainNode = ctx.createGain();

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (convolverRef.current) gainNode.connect(convolverRef.current);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      noise.start(time);
      noise.stop(time + 0.1);
    }
  };

  const playMech = (ctx: AudioContext, time: number, beatType: number) => {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    // Mechanical preset is dry/crisp, no reverb
    // if (convolverRef.current) gainNode.connect(convolverRef.current);

    filter.type = "bandpass";

    let centerFreq = 1500;
    let q = 5.0;
    let peakGain = 4;
    let decay = 0.03;

    if (beatType === BEAT_ACCENT) {
      centerFreq = 2000;
      q = 4.0;
      peakGain = 10;
      decay = 0.05;
    } else if (beatType === BEAT_SUB_ACCENT) {
      centerFreq = 1800;
      q = 4.5;
      peakGain = 7;
      decay = 0.04;
    }

    filter.frequency.value = centerFreq;
    filter.Q.value = q;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + decay);

    noise.start(time);
    noise.stop(time + decay + 0.02);
  };

  const stepStatesRef = useRef(stepStates);

  useEffect(() => {
    stepStatesRef.current = stepStates;
  }, [stepStates]);

  const isMeasureMuted = useCallback((currentMeasure: number): boolean => {
    const rt = intervalTrainerRef.current;
    if (!rt || !rt.enabled) return false;

    const cycleLength = rt.playBars + rt.muteBars;
    const positionInCycle = currentMeasure % cycleLength;
    return positionInCycle >= rt.playBars;
  }, []);

  const playSound = useCallback(
    (time: number, beatNumber: number, currentMeasure: number) => {
      if (!audioContext.current) return;

      const currentStepStates = stepStatesRef.current;
      const totalSteps = currentStepStates.length;
      const shift = shiftRef.current;

      if (totalSteps === 0) return;

      // Shift logic: shift the "1" by applying an offset to the index lookup.
      // E.g., if shift is 1, beat 0 should play the sound of index (total-1).
      // If we want "Shift +1" to mean "everything shifts LATER by 1 step",
      // then on physical beat 0, we play the sound that WAS at index -1 (or total-1).
      // Let's stick to: Shift +1 means the internal pattern is shifted +1 step LATER.
      // So on Beat 0, we are "waiting" for the pattern, effectively playing the sound of index -1.
      let shiftedIndex = (beatNumber - shift) % totalSteps;
      if (shiftedIndex < 0) shiftedIndex += totalSteps;

      const beatType = currentStepStates[shiftedIndex];

      if (beatType === BEAT_MUTE) return;

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
    const safeSubdivision = Math.max(1, subdivision || 1);
    const safeBpm = Math.max(1, bpm || 120);
    const secondsPerSubdivision = 60.0 / safeBpm / safeSubdivision;
    nextNoteTime.current += secondsPerSubdivision;
  }, [bpm, subdivision]);

  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const subdivisionRef = useRef(subdivision);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
    subdivisionRef.current = subdivision;
  }, [beatsPerMeasure, subdivision]);

  const scheduleNote = useCallback(
    (beatCounter: number, time: number) => {
      // Swing Logic: If playing 8th notes (subdiv 2) or 16th (subdiv 4),
      // we delay the even-numbered subdivisions.
      // Logic: if beatCounter % 2 !== 0, add delay.
      let playTime = time;
      const swing = swingRef.current; // 0-100

      if (swing > 0 && subdivisionRef.current >= 2 && beatCounter % 2 !== 0) {
        // Calculate max delay (triplet feel is ~33% delay of the beat duration, but let's stick to 0-1 range logic)
        // If swing is 100%, it sounds like a dotted note.
        // Let's say max swing (100) = moving the offbeat to 2/3 position (triplet swing) or further?
        // Standard "Shuffle" (Triplet) is effectively 66% swing if we define 50% as straight.
        // Let's map 0-100 to: 0ms -> max feasible delay.
        // Actually, let's map it as a percentage of the subdivision interval.
        // If we have 1/8th notes. Distance between beats is T.
        // Straight: Offbeat at 0.5 * T.
        // Swing: Offbeat pushed later.
        // Let's simpler logic:
        // swing 0 -> 0 offset.
        // swing 100 -> offbeat pushed by 33% of the subdivision duration (triplet feel approx).

        const safeBpm = Math.max(1, bpm || 120);
        // Duration of one subdivision step
        const stepDuration = 60.0 / safeBpm / (subdivisionRef.current || 1);

        // Max swing delay: we don't want to overlap the next beat.
        // Let's say at 100% swing, we push the note by 2/3rds?
        // A common Swing ratio is 2:1 (triplets).
        // Straight is 1:1.
        // In straight 8ths, the offbeat is at 0.5 of the beat.
        // In triplet swing, the offbeat is at 0.666 of the beat.
        // Difference is 0.166 of the beat.
        // So let's offset by (swing / 100) * (stepDuration * 0.66)?
        // Let's try: Swing 50 = Triplet feel?
        // Let's stick to standard MPC swing:
        // 50% = straight. 66% = triplet. 75% = dotted 16th.
        // But our input is 0-100 slider.
        // Let's assume input 0 = 50% (straight), 100 = 75% (heavy swing).

        // Wait, user asked for "Swing 50% = Straight, 66% = Triplet".
        // So the input from UI should likely be mapped or treated directly.
        // If we just take a 0-100 factor from UI:
        // Let's treat UI slider 0 as "Straight" and 100 as "Hard Swing".

        const maxDelay = stepDuration * 0.4; // Can shift up to 40% of the step duration
        const delay = (swing / 100) * maxDelay;
        playTime += delay;
      }

      const stepsPerMeasure = beatsPerMeasureRef.current * subdivisionRef.current;
      const currentMeasure = Math.floor(beatCounter / stepsPerMeasure);

      notesInQueue.current.push({ note: beatCounter, time: playTime });
      playSound(playTime, beatCounter, currentMeasure);

      if (currentMeasure > lastMeasureRef.current) {
        lastMeasureRef.current = currentMeasure;
        setMeasureCount(currentMeasure);

        if (onMeasureCompleteRef.current) {
          onMeasureCompleteRef.current(currentMeasure);
        }
      }
    },
    [playSound]
  );

  const scheduler = useCallback(() => {
    if (!audioContext.current) return;

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

  useEffect(() => {
    if (isPlaying) {
      ensureAudioContext();
      if (audioContext.current) {
        nextNoteTime.current = audioContext.current.currentTime + 0.05;
      }
      schedulerRef.current.beatCounter = 0;
      lastMeasureRef.current = -1;
      setMeasureCount(0);
      scheduler();
    } else {
      if (timerID.current) window.clearTimeout(timerID.current);
    }
    return () => {
      if (timerID.current) window.clearTimeout(timerID.current);
    };
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
      const VISUAL_OFFSET = 0.025;

      while (
        notesInQueue.current.length &&
        notesInQueue.current[0].time < currentTime + VISUAL_OFFSET
      ) {
        const currentNote = notesInQueue.current[0];

        // Apply shift to visualizer as well
        const currentStepStates = stepStatesRef.current;
        const totalSteps = currentStepStates.length || 1;
        const shift = shiftRef.current;

        let shiftedIndex = (currentNote.note - shift) % totalSteps;
        if (shiftedIndex < 0) shiftedIndex += totalSteps;

        setVisualBeat(shiftedIndex);
        notesInQueue.current.splice(0, 1);
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, beatsPerMeasure, subdivision]);

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
