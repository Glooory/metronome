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
  beatsPerMeasure,
  subdivision,
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
                        ? "rgba(34, 211, 238, 1)"
                        : isAccent
                          ? "rgba(34, 211, 238, 0.3)"
                          : "rgba(255, 255, 255, 0.02)",
                  }}
                  className={styles["visualizer__block"]}
                />
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive && (isAccent || isSubAccent)
                        ? "rgba(34, 211, 238, 1)"
                        : isAccent || isSubAccent
                          ? "rgba(34, 211, 238, 0.3)"
                          : "rgba(255, 255, 255, 0.02)",
                  }}
                  className={styles["visualizer__block"]}
                />
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      isActive && !isMute
                        ? "rgba(34, 211, 238, 1)"
                        : !isMute
                          ? "rgba(34, 211, 238, 0.3)"
                          : "rgba(255, 255, 255, 0.02)",
                  }}
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
