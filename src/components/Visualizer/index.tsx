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
  const t = translations.swingTrainer;
  const maxShift = Math.max(1, stepStates.length - 1);
  const minShift = -maxShift;
  const canShiftLeft = shift > minShift;
  const canShiftRight = shift < maxShift;
  const getBlockBackground = (isFilled: boolean, isActive: boolean) => {
    if (isActive && isFilled) {
      return "var(--visualizer-block-accent, var(--accent-primary))";
    }

    if (isFilled) {
      return "var(--visualizer-block-accent-dim, var(--accent-primary-muted))";
    }

    return "var(--visualizer-block-empty, var(--visualizer-block-bg, var(--fill-subtle)))";
  };

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
            title="Shift Left (Early)"
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
            title="Shift Right (Delay)"
          >
            <Plus size={24} />
          </Button>
        </div>

        <Button
          noPadding
          disabled={shift === 0}
          style={{ visibility: shift !== 0 ? "visible" : "hidden" }}
          className={styles["visualizer__reset-btn"]}
          onClick={() => onShiftChange(0)}
          title={t.reset[language]}
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
                <div
                  style={{ background: getBlockBackground(isAccent, isActive) }}
                  className={clsx(
                    styles["visualizer__block"],
                    (isActive && isAccent) || isAccent
                      ? styles["visualizer__block--filled"]
                      : undefined
                  )}
                />
                <div
                  style={{ background: getBlockBackground(isAccent || isSubAccent, isActive) }}
                  className={clsx(
                    styles["visualizer__block"],
                    (isActive && (isAccent || isSubAccent)) || isAccent || isSubAccent
                      ? styles["visualizer__block--filled"]
                      : undefined
                  )}
                />
                <div
                  style={{ background: getBlockBackground(!isMute, isActive) }}
                  className={clsx(
                    styles["visualizer__block"],
                    (isActive && !isMute) || !isMute
                      ? styles["visualizer__block--filled"]
                      : undefined
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
