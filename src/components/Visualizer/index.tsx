import clsx from "clsx";
import { motion } from "framer-motion";
import { Minus, Plus, RefreshCcw } from "lucide-react";
import { BEAT_ACCENT, BEAT_MUTE, BEAT_SUB_ACCENT } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
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

  return (
    <div className={styles.visualizer}>
      <div className={styles["visualizer__header"]}>
        <span className={styles["visualizer__label"]}>
          {translations.visualizer.shift[language]}:
        </span>
        <div className={styles["visualizer__controls"]}>
          <button
            className={styles["visualizer__control-btn"]}
            onClick={() => canShiftLeft && onShiftChange(shift - 1)}
            title="Shift Left (Early)"
            disabled={!canShiftLeft}
            style={{
              opacity: canShiftLeft ? 1 : 0.4,
              cursor: canShiftLeft ? "pointer" : "default",
            }}
          >
            <Minus size={16} />
          </button>

          <span
            className={clsx(
              styles["visualizer__value"],
              shift !== 0 && styles["visualizer__value--active"]
            )}
          >
            {shift > 0 ? `+${shift}` : shift}
          </span>

          <button
            className={styles["visualizer__control-btn"]}
            onClick={() => canShiftRight && onShiftChange(shift + 1)}
            title="Shift Right (Delay)"
            disabled={!canShiftRight}
            style={{
              opacity: canShiftRight ? 1 : 0.4,
              cursor: canShiftRight ? "pointer" : "default",
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          className={styles["visualizer__reset-btn"]}
          onClick={() => onShiftChange(0)}
          title={t.reset[language]}
          style={{ opacity: shift !== 0 ? 1 : 0, pointerEvents: shift !== 0 ? "auto" : "none" }}
        >
          <RefreshCcw size={16} />
        </button>
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
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive && isAccent
                        ? "var(--theme-visualizer-accent)"
                        : isAccent
                          ? "var(--theme-visualizer-accent-dim)"
                          : "var(--theme-visualizer-empty)",
                  }}
                  transition={{ duration: isActive ? 0 : 0.1 }}
                  className={styles["visualizer__block"]}
                />
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive && (isAccent || isSubAccent)
                        ? "var(--theme-visualizer-accent)"
                        : isAccent || isSubAccent
                          ? "var(--theme-visualizer-accent-dim)"
                          : "var(--theme-visualizer-empty)",
                  }}
                  transition={{ duration: isActive ? 0 : 0.1 }}
                  className={styles["visualizer__block"]}
                />
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive && !isMute
                        ? "var(--theme-visualizer-accent)"
                        : !isMute
                          ? "var(--theme-visualizer-accent-dim)"
                          : "var(--theme-visualizer-empty)",
                  }}
                  transition={{ duration: isActive ? 0 : 0.1 }}
                  className={styles["visualizer__block"]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
