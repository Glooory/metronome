import { AudioWaveform, Gauge, ListMusic, VolumeX } from "lucide-react";
import type { IntervalTrainerConfig, SpeedTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
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
      <Button
        isChecked={speedTrainer.enabled}
        className={styles["trainer-dock__btn"]}
        onClick={onSpeedClick}
        title={t.speedTooltip[language]}
      >
        <Gauge size={16} />
        <span>{t.speed[language]}</span>
      </Button>

      <Button
        isChecked={intervalTrainer.enabled}
        className={styles["trainer-dock__btn"]}
        onClick={onIntervalClick}
        title={t.intervalTooltip[language]}
      >
        <VolumeX size={16} />
        <span>{t.interval[language]}</span>
      </Button>

      <Button
        isChecked={swing > 0}
        className={styles["trainer-dock__btn"]}
        onClick={onSwingClick}
        title={t.swingTooltip[language]}
      >
        <AudioWaveform size={16} />
        <span>{t.swing[language]}</span>
      </Button>

      <Button
        className={styles["trainer-dock__btn"]}
        onClick={onPresetsClick}
        title={t.presetsTooltip[language]}
      >
        <ListMusic size={16} />
        <span>{t.presets[language]}</span>
      </Button>
    </div>
  );
};
