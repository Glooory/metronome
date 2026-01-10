import { clsx } from "clsx";
import { AudioWaveform, Gauge, ListMusic, VolumeX } from "lucide-react";
import type { IntervalTrainerConfig, SpeedTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import styles from "./styles.module.css";

interface TrainerDockProps {
  speedTrainer: SpeedTrainerConfig;
  intervalTrainer: IntervalTrainerConfig;
  swing: number;
  onSpeedClick: () => void;
  onIntervalClick: () => void;
  onSwingClick: () => void;
  onPresetsClick: () => void;
  language: Language;
}

export const TrainerDock = ({
  speedTrainer,
  intervalTrainer,
  swing,
  onSpeedClick,
  onIntervalClick,
  onSwingClick,
  onPresetsClick,
  language,
}: TrainerDockProps) => {
  const t = translations.trainer;

  return (
    <div className={styles["trainer-dock"]}>
      <button
        className={clsx(
          styles["trainer-dock__btn"],
          speedTrainer.enabled && styles["trainer-dock__btn--active"]
        )}
        onClick={onSpeedClick}
        title={t.speedTooltip[language]}
      >
        <Gauge size={16} className={styles["trainer-dock__btn-icon"]} />
        <span>{t.speed[language]}</span>
      </button>

      <button
        className={clsx(
          styles["trainer-dock__btn"],
          intervalTrainer.enabled && styles["trainer-dock__btn--active"]
        )}
        onClick={onIntervalClick}
        title={t.intervalTooltip[language]}
      >
        <VolumeX size={16} className={styles["trainer-dock__btn-icon"]} />
        <span>{t.interval[language]}</span>
      </button>

      <button
        className={clsx(
          styles["trainer-dock__btn"],
          swing > 0 && styles["trainer-dock__btn--active"]
        )}
        onClick={onSwingClick}
        title={t.swingTooltip[language]}
      >
        <AudioWaveform size={16} className={styles["trainer-dock__btn-icon"]} />
        <span>{t.swing[language]}</span>
      </button>

      <button
        className={styles["trainer-dock__btn"]}
        onClick={onPresetsClick}
        title={t.presetsTooltip[language]}
      >
        <ListMusic size={16} className={styles["trainer-dock__btn-icon"]} />
        <span>{t.presets[language]}</span>
      </button>
    </div>
  );
};
