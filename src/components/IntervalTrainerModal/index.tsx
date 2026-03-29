import { clsx } from "clsx";
import { VolumeX } from "lucide-react";
import type { IntervalTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";
import { ModalShell } from "../ModalShell";
import styles from "./styles.module.css";

interface IntervalTrainerModalProps {
  isOpen: boolean;
  config: IntervalTrainerConfig;
  onConfigChange: (config: IntervalTrainerConfig) => void;
  onClose: () => void;
  measureCount: number;
  isMuted: boolean;
  language: Language;
}

export const IntervalTrainerModal = ({
  isOpen,
  config,
  onConfigChange,
  onClose,
  measureCount,
  isMuted,
  language,
}: IntervalTrainerModalProps) => {
  const common = translations.common;
  const t = translations.intervalTrainer;

  const handleToggle = () => {
    onConfigChange({ ...config, enabled: !config.enabled });
  };

  const handleChange = (key: keyof IntervalTrainerConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  const cycleLength = config.playBars + config.muteBars;
  const positionInCycle = measureCount % cycleLength;
  const barsUntilChange = isMuted
    ? config.muteBars - (positionInCycle - config.playBars)
    : config.playBars - positionInCycle;

  return (
    <ModalShell
      isOpen={isOpen}
      title={t.title[language]}
      closeLabel={common.close[language]}
      onClose={onClose}
      icon={VolumeX}
      panelClassName={styles["interval-trainer-modal__panel"]}
    >
      <div className={styles["interval-trainer-modal__content"]}>
        <div className={styles["interval-trainer-modal__row"]}>
          <span className={styles["interval-trainer-modal__label"]}>
            {t.enableTraining[language]}
          </span>
          <Checkbox checked={config.enabled} onChange={handleToggle} aria-label={t.enableTraining[language]} />
        </div>

        <div className={styles["interval-trainer-modal__divider"]} />

        <div className={styles["interval-trainer-modal__row"]}>
          <span className={styles["interval-trainer-modal__label"]}>{t.playBars[language]}</span>
          <Input
            type="number"
            className={styles["interval-trainer-modal__input"]}
            font="metric"
            size="sm"
            align="center"
            hideNumberSpinner
            value={config.playBars}
            min={1}
            max={16}
            onChange={(e) => handleChange("playBars", Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div className={styles["interval-trainer-modal__row"]}>
          <span className={styles["interval-trainer-modal__label"]}>{t.muteBars[language]}</span>
          <Input
            type="number"
            className={styles["interval-trainer-modal__input"]}
            font="metric"
            size="sm"
            align="center"
            hideNumberSpinner
            value={config.muteBars}
            min={1}
            max={16}
            onChange={(e) => handleChange("muteBars", Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        {config.enabled && (
          <>
            <div className={styles["interval-trainer-modal__divider"]} />
            <div
              className={clsx(
                styles["interval-trainer-modal__status"],
                isMuted && styles["interval-trainer-modal__status--muted"]
              )}
            >
              <div className={styles["interval-trainer-modal__status-text"]}>
                {isMuted ? (
                  <>
                    <span className={styles["interval-trainer-modal__status-highlight"]}>
                      {t.muted[language]}
                    </span>
                    <br />
                    {barsUntilChange} {t.untilResume[language]}
                  </>
                ) : (
                  <>
                    <span className={styles["interval-trainer-modal__status-highlight"]}>
                      {t.playing[language]}
                    </span>
                    <br />
                    {barsUntilChange} {t.untilMute[language]}
                  </>
                )}
              </div>
            </div>
            <p className={styles["interval-trainer-modal__hint"]}>{t.hint[language]}</p>
          </>
        )}
      </div>
    </ModalShell>
  );
};
