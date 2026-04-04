import {
  BEAT_ACCENT,
  BEAT_NORMAL,
  BEAT_SUB_ACCENT,
  BPM_BIND_NOTE_OPTIONS,
  MAX_BEATS_PER_MEASURE,
  MIN_BEATS_PER_MEASURE,
} from "../constants";

const clampBeatsPerMeasure = (value: number) =>
  Math.min(Math.max(value, MIN_BEATS_PER_MEASURE), MAX_BEATS_PER_MEASURE);

export const isSubdivisionAllowed = (beatUnit: number, subdivision: number) =>
  subdivision >= 1 && subdivision <= 4 && beatUnit * subdivision <= 32;

export const normalizeSubdivisionForBeatUnit = (beatUnit: number, subdivision: number) => {
  const normalizedSubdivision = Number.isFinite(subdivision) ? Math.round(subdivision) : 1;
  return isSubdivisionAllowed(beatUnit, normalizedSubdivision) ? normalizedSubdivision : 1;
};

export const convertBeatsPerMeasureForBeatUnit = (
  beatsPerMeasure: number,
  currentBeatUnit: number,
  nextBeatUnit: number
) => clampBeatsPerMeasure(Math.round((beatsPerMeasure * nextBeatUnit) / currentBeatUnit));

const getBaseBeatPattern = (beatsPerMeasure: number) => {
  if (beatsPerMeasure <= 1) return [BEAT_ACCENT];
  if (beatsPerMeasure === 2) return [BEAT_ACCENT, BEAT_NORMAL];
  if (beatsPerMeasure === 3) return [BEAT_ACCENT, BEAT_NORMAL, BEAT_NORMAL];
  if (beatsPerMeasure === 4) return [BEAT_ACCENT, BEAT_NORMAL, BEAT_SUB_ACCENT, BEAT_NORMAL];

  if (beatsPerMeasure >= 6 && beatsPerMeasure % 3 === 0) {
    return Array.from({ length: beatsPerMeasure }, (_, index) => {
      if (index === 0) return BEAT_ACCENT;
      return index % 3 === 0 ? BEAT_SUB_ACCENT : BEAT_NORMAL;
    });
  }

  return Array.from({ length: beatsPerMeasure }, (_, index) =>
    index === 0 ? BEAT_ACCENT : BEAT_NORMAL
  );
};

export const createDefaultStepStates = (beatsPerMeasure: number, subdivision: number) =>
  getBaseBeatPattern(beatsPerMeasure).flatMap((beatState) => [
    beatState,
    ...Array.from({ length: Math.max(0, subdivision - 1) }, () => BEAT_NORMAL),
  ]);

export const getSubdivisionLabel = (beatUnit: number, subdivision: number) => {
  if (subdivision === 3) {
    return `1/${beatUnit}T`;
  }

  return `1/${beatUnit * subdivision}`;
};

export const getBpmBindNoteLabel = (value: number) =>
  BPM_BIND_NOTE_OPTIONS.find((option) => option.value === value)?.label ?? "1/4";
