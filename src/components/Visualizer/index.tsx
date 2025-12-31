import { motion } from "framer-motion";
import { BEAT_ACCENT, BEAT_MUTE, BEAT_SUB_ACCENT } from "../../constants";
import styles from "./styles.module.css";

interface VisualizerProps {
  activeBeat: number | null;
  beatsPerMeasure: number;
  subdivision: number;
  stepStates: number[];
  toggleStepState: (index: number) => void;
}

export const Visualizer = ({
  activeBeat,
  stepStates,
  toggleStepState,
}: VisualizerProps) => {
  return (
    <div className={styles.visualizer}>
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
