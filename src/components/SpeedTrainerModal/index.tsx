import { clsx } from "clsx";
import { Gauge } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { MAX_BPM, SPEED_TRAINER_LIMITS, type SpeedTrainerConfig } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
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
  const everyMeasuresRange = SPEED_TRAINER_LIMITS.everyMeasures;
  const incrementRange = SPEED_TRAINER_LIMITS.increment;
  const targetBpmMin = Math.max(currentBpm, SPEED_TRAINER_LIMITS.targetBpm.min);
  const targetBpmMax = SPEED_TRAINER_LIMITS.targetBpm.max;
  const [draftConfig, setDraftConfig] = useState({
    enabled: config.enabled,
    everyMeasures: String(config.everyMeasures),
    increment: String(config.increment),
    targetBpm: String(config.targetBpm),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftConfig({
      enabled: config.enabled,
      everyMeasures: String(config.everyMeasures),
      increment: String(config.increment),
      targetBpm: String(config.targetBpm),
    });
  }, [config.enabled, config.everyMeasures, config.increment, config.targetBpm, isOpen]);

  const handleToggle = () => {
    setDraftConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateDraftValue = (
    key: "everyMeasures" | "increment" | "targetBpm",
    value: string
  ) => {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
  };

  const clampValue = (value: string, min: number, max: number, fallback: number) => {
    const parsedValue = parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, parsedValue));
  };

  const getSanitizedConfig = (): SpeedTrainerConfig => {
    const everyMeasures = clampValue(
      draftConfig.everyMeasures,
      everyMeasuresRange.min,
      everyMeasuresRange.max,
      everyMeasuresRange.min
    );
    const increment = clampValue(
      draftConfig.increment,
      incrementRange.min,
      incrementRange.max,
      incrementRange.min
    );
    const targetBpm = clampValue(draftConfig.targetBpm, targetBpmMin, targetBpmMax, targetBpmMin);

    return {
      enabled: draftConfig.enabled,
      everyMeasures,
      increment,
      targetBpm,
    };
  };

  const handleApply = () => {
    const nextConfig = getSanitizedConfig();
    onConfigChange(nextConfig);
    setDraftConfig({
      enabled: nextConfig.enabled,
      everyMeasures: String(nextConfig.everyMeasures),
      increment: String(nextConfig.increment),
      targetBpm: String(nextConfig.targetBpm),
    });
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleApply();
    }
  };

  const previewConfig = getSanitizedConfig();
  const measuresUntilNext =
    previewConfig.everyMeasures - (measureCount % previewConfig.everyMeasures);
  const hasReachedTarget = currentBpm >= previewConfig.targetBpm;
  const everyMeasuresLabel = `${t.everyMeasures[language]} (${everyMeasuresRange.min}-${everyMeasuresRange.max})`;
  const incrementLabel = `${t.incrementBpm[language]} (${incrementRange.min}-${incrementRange.max})`;
  const targetBpmLabel = `${t.targetBpm[language]} (${targetBpmMin}-${targetBpmMax})`;

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
            checked={draftConfig.enabled}
            onChange={handleToggle}
            aria-label={t.enableTraining[language]}
          />
        </div>

        <div className={styles["speed-trainer-modal__divider"]} />

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{everyMeasuresLabel}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="md"
            align="center"
            hideNumberSpinner
            value={draftConfig.everyMeasures}
            onChange={(e) => updateDraftValue("everyMeasures", e.target.value)}
            onKeyDown={handleKeyDown}
            min={everyMeasuresRange.min}
            max={everyMeasuresRange.max}
          />
        </div>

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{incrementLabel}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="md"
            align="center"
            hideNumberSpinner
            value={draftConfig.increment}
            onChange={(e) => updateDraftValue("increment", e.target.value)}
            onKeyDown={handleKeyDown}
            min={incrementRange.min}
            max={incrementRange.max}
          />
        </div>

        <div className={styles["speed-trainer-modal__row"]}>
          <span className={styles["speed-trainer-modal__label"]}>{targetBpmLabel}</span>
          <Input
            type="number"
            className={styles["speed-trainer-modal__input"]}
            font="metric"
            size="md"
            align="center"
            hideNumberSpinner
            value={draftConfig.targetBpm}
            onChange={(e) => updateDraftValue("targetBpm", e.target.value)}
            onKeyDown={handleKeyDown}
            min={targetBpmMin}
            max={MAX_BPM}
          />
        </div>

        {/* Status section stays mounted to keep modal height stable. */}
        <div
          className={clsx(
            styles["speed-trainer-modal__divider"],
            !previewConfig.enabled && styles["speed-trainer-modal__divider--hidden"]
          )}
        />
        <div
          className={clsx(
            styles["speed-trainer-modal__status"],
            !previewConfig.enabled && styles["speed-trainer-modal__status--inactive"]
          )}
        >
          <div className={styles["speed-trainer-modal__status-text"]}>
            {hasReachedTarget ? (
              <>
                {t.reachedTarget[language]}{" "}
                <span className={styles["speed-trainer-modal__status-highlight"]}>
                  {previewConfig.targetBpm} BPM
                </span>
              </>
            ) : (
              <>
                {measuresUntilNext} {t.measuresUntil[language]}
                <br />
                BPM: {currentBpm} →{" "}
                <span className={styles["speed-trainer-modal__status-highlight"]}>
                  {Math.min(currentBpm + previewConfig.increment, previewConfig.targetBpm)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={styles["speed-trainer-modal__actions"]}>
          <Button variant="filled" className={styles["speed-trainer-modal__confirm"]} onClick={handleApply}>
            {common.save[language]}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
