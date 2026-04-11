import { clsx } from "clsx";
import { VolumeX } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { INTERVAL_TRAINER_LIMITS, type IntervalTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
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
  const playBarsRange = INTERVAL_TRAINER_LIMITS.playBars;
  const muteBarsRange = INTERVAL_TRAINER_LIMITS.muteBars;
  const [draftConfig, setDraftConfig] = useState({
    enabled: config.enabled,
    playBars: String(config.playBars),
    muteBars: String(config.muteBars),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftConfig({
      enabled: config.enabled,
      playBars: String(config.playBars),
      muteBars: String(config.muteBars),
    });
  }, [config.enabled, config.playBars, config.muteBars, isOpen]);

  const handleToggle = () => {
    setDraftConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateDraftValue = (key: "playBars" | "muteBars", value: string) => {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
  };

  const clampValue = (value: string, min: number, max: number, fallback: number) => {
    const parsedValue = parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, parsedValue));
  };

  const getSanitizedConfig = (): IntervalTrainerConfig => {
    const playBars = clampValue(
      draftConfig.playBars,
      playBarsRange.min,
      playBarsRange.max,
      playBarsRange.min
    );
    const muteBars = clampValue(
      draftConfig.muteBars,
      muteBarsRange.min,
      muteBarsRange.max,
      muteBarsRange.min
    );

    return {
      enabled: draftConfig.enabled,
      playBars,
      muteBars,
    };
  };

  const handleApply = () => {
    const nextConfig = getSanitizedConfig();
    onConfigChange(nextConfig);
    setDraftConfig({
      enabled: nextConfig.enabled,
      playBars: String(nextConfig.playBars),
      muteBars: String(nextConfig.muteBars),
    });
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleApply();
    }
  };

  const previewConfig = getSanitizedConfig();
  const cycleLength = previewConfig.playBars + previewConfig.muteBars;
  const positionInCycle = measureCount % cycleLength;
  const barsUntilChange = isMuted
    ? previewConfig.muteBars - (positionInCycle - previewConfig.playBars)
    : previewConfig.playBars - positionInCycle;
  const playBarsLabel = `${t.playBars[language]} (${playBarsRange.min}-${playBarsRange.max})`;
  const muteBarsLabel = `${t.muteBars[language]} (${muteBarsRange.min}-${muteBarsRange.max})`;

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
          <Checkbox
            checked={draftConfig.enabled}
            onChange={handleToggle}
            aria-label={t.enableTraining[language]}
          />
        </div>

        <div className={styles["interval-trainer-modal__divider"]} />

        <div className={styles["interval-trainer-modal__row"]}>
          <span className={styles["interval-trainer-modal__label"]}>{playBarsLabel}</span>
          <Input
            type="number"
            className={styles["interval-trainer-modal__input"]}
            font="metric"
            size="md"
            align="center"
            hideNumberSpinner
            value={draftConfig.playBars}
            min={playBarsRange.min}
            max={playBarsRange.max}
            onChange={(e) => updateDraftValue("playBars", e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles["interval-trainer-modal__row"]}>
          <span className={styles["interval-trainer-modal__label"]}>{muteBarsLabel}</span>
          <Input
            type="number"
            className={styles["interval-trainer-modal__input"]}
            font="metric"
            size="md"
            align="center"
            hideNumberSpinner
            value={draftConfig.muteBars}
            min={muteBarsRange.min}
            max={muteBarsRange.max}
            onChange={(e) => updateDraftValue("muteBars", e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {previewConfig.enabled && (
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
        <div className={styles["interval-trainer-modal__actions"]}>
          <Button
            variant="filled"
            className={styles["interval-trainer-modal__confirm"]}
            onClick={handleApply}
          >
            {common.save[language]}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
