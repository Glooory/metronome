import { clsx } from "clsx";
import { Gauge } from "lucide-react";
import type { SpeedTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";
import { ModalShell } from "../ModalShell";
import styles from "./styles.module.css";

interface SpeedTrainerModalProps {
  isOpen: boolean;
  config: SpeedTrainerConfig;
  onConfigChange: (config: SpeedTrainerConfig) => void;
  onClose: () => void;
  currentBpm: number;
  measureCount: number;
  language: Language;
}

export const SpeedTrainerModal = ({
  isOpen,
  config,
  onConfigChange,
  onClose,
  currentBpm,
  measureCount,
  language,
}: SpeedTrainerModalProps) => {
  const common = translations.common;
  const t = translations.speedTrainer;

  const handleToggle = () => {
    onConfigChange({ ...config, enabled: !config.enabled });
  };

  const handleChange = (key: keyof SpeedTrainerConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  const measuresUntilNext = config.everyMeasures - (measureCount % config.everyMeasures);
  const hasReachedTarget = currentBpm >= config.targetBpm;

  return (
    <ModalShell
      isOpen={isOpen}
      title={t.title[language]}
      closeLabel={common.close[language]}
      onClose={onClose}
      icon={Gauge}
      panelClassName={styles["speed-trainer-modal__panel"]}
    >
      <div className={styles["speed-trainer-modal__content"]}>
        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{t.enableTraining[language]}</span>
          <Checkbox
            checked={config.enabled}
            onChange={handleToggle}
            aria-label={t.enableTraining[language]}
          />
        </div>

        <div className={styles["speed-trainer-modal__divider"]} />

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{t.everyMeasures[language]}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="sm"
            align="center"
            hideNumberSpinner
            value={config.everyMeasures}
            onChange={(e) =>
              handleChange("everyMeasures", Math.max(1, parseInt(e.target.value) || 1))
            }
            min={1}
            max={32}
          />
        </div>

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{t.incrementBpm[language]}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="sm"
            align="center"
            hideNumberSpinner
            value={config.increment}
            onChange={(e) => handleChange("increment", Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={50}
          />
        </div>

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{t.targetBpm[language]}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="sm"
            align="center"
            hideNumberSpinner
            value={config.targetBpm}
            onChange={(e) =>
              handleChange("targetBpm", Math.max(currentBpm, parseInt(e.target.value) || 200))
            }
            min={currentBpm}
            max={300}
          />
        </div>

        {/* Status section stays mounted to keep modal height stable. */}
        <div
          className={clsx(
            styles["speed-trainer-modal__divider"],
            !config.enabled && styles["speed-trainer-modal__divider--hidden"]
          )}
        />
        <div
          className={clsx(
            styles["speed-trainer-modal__status"],
            !config.enabled && styles["speed-trainer-modal__status--inactive"]
          )}
        >
          <div className={styles["speed-trainer-modal__status-text"]}>
            {hasReachedTarget ? (
              <>
                {t.reachedTarget[language]}{" "}
                <span className={styles["speed-trainer-modal__status-highlight"]}>
                  {config.targetBpm} BPM
                </span>
              </>
            ) : (
              <>
                {measuresUntilNext} {t.measuresUntil[language]}
                <br />
                BPM: {currentBpm} →{" "}
                <span className={styles["speed-trainer-modal__status-highlight"]}>
                  {Math.min(currentBpm + config.increment, config.targetBpm)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
