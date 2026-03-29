import clsx from "clsx";
import { Minus, Plus, RefreshCcw } from "lucide-react";
import { BEAT_ACCENT, BEAT_MUTE, BEAT_SUB_ACCENT } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface VisualizerProps {
  activeBeat: number | null;
  beatsPerMeasure: number;
  subdivision: number;
  stepStates: number[];
  toggleStepState: (index: number) => void;
  shift: number;
  onShiftChange: (value: number) => void;
  language: Language;
}

export const Visualizer = ({
  activeBeat,
  stepStates,
  toggleStepState,
  shift,
  onShiftChange,
  language,
}: VisualizerProps) => {
  const common = translations.common;
  const t = translations.visualizer;
  const maxShift = Math.max(1, stepStates.length - 1);
  const minShift = -maxShift;
  const canShiftLeft = shift > minShift;
  const canShiftRight = shift < maxShift;
  const getBlockClassName = (isFilled: boolean, isActive: boolean) =>
    clsx(
      styles["visualizer__block"],
      isFilled && styles["visualizer__block--filled"],
      !isFilled && styles["visualizer__block--empty"],
      isActive && isFilled && styles["visualizer__block--filled-active"]
    );

  return (
    <div className={styles.visualizer}>
      <div className={styles["visualizer__header"]}>
        <span className={styles["visualizer__label"]}>
          {translations.visualizer.shift[language]}:
        </span>
        <div className={styles["visualizer__controls"]}>
          <Button
            noPadding
            disabled={!canShiftLeft}
            className={styles["visualizer__control-btn"]}
            onClick={() => canShiftLeft && onShiftChange(shift - 1)}
            title={t.shiftLeft[language]}
          >
            <Minus size={24} />
          </Button>

          <span
            className={clsx(
              styles["visualizer__value"],
              shift !== 0 && styles["visualizer__value--active"]
            )}
          >
            {shift > 0 ? `+${shift}` : shift}
          </span>

          <Button
            noPadding
            disabled={!canShiftRight}
            className={styles["visualizer__control-btn"]}
            onClick={() => canShiftRight && onShiftChange(shift + 1)}
            title={t.shiftRight[language]}
          >
            <Plus size={24} />
          </Button>
        </div>

        <Button
          noPadding
          disabled={shift === 0}
          className={clsx(
            styles["visualizer__reset-btn"],
            shift === 0 && styles["visualizer__reset-btn--hidden"]
          )}
          onClick={() => onShiftChange(0)}
          title={common.reset[language]}
        >
          <RefreshCcw size={20} />
        </Button>
      </div>

      <div className={styles["visualizer__container"]}>
        {stepStates.map((currentState, i) => {
          const isAccent = currentState === BEAT_ACCENT;
          const isSubAccent = currentState === BEAT_SUB_ACCENT;
          const isMute = currentState === BEAT_MUTE;

          const isActive = activeBeat === i;

          return (
            <div
              key={i}
              onClick={() => toggleStepState(i)}
              className={styles["visualizer__column"]}
            >
              <div className={styles["visualizer__stack"]}>
                <div className={getBlockClassName(isAccent, isActive)} />
                <div className={getBlockClassName(isAccent || isSubAccent, isActive)} />
                <div className={getBlockClassName(!isMute, isActive)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
