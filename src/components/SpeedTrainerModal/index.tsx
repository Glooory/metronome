import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Gauge, X } from 'lucide-react';
import type { SpeedTrainerConfig } from '../../constants';
import type { Language } from '../../i18n';
import { translations } from '../../i18n';
import styles from './styles.module.css';

interface SpeedTrainerModalProps {
  config: SpeedTrainerConfig;
  onConfigChange: (config: SpeedTrainerConfig) => void;
  onClose: () => void;
  currentBpm: number;
  measureCount: number;
  language: Language;
}

export const SpeedTrainerModal = ({
  config,
  onConfigChange,
  onClose,
  currentBpm,
  measureCount,
  language,
}: SpeedTrainerModalProps) => {
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
    <motion.div
      className={styles['speed-trainer-modal__overlay']}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles['speed-trainer-modal']}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['speed-trainer-modal__header']}>
          <div className={styles['speed-trainer-modal__title']}>
            <Gauge size={20} className={styles['speed-trainer-modal__title-icon']} />
            {t.title[language]}
          </div>
          <button className={styles['speed-trainer-modal__close-btn']} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles['speed-trainer-modal__content']}>
          <div className={styles['speed-trainer-modal__row']}>
            <span className={styles['speed-trainer-modal__label']}>{t.enableTraining[language]}</span>
            <div
              className={clsx(styles['speed-trainer-modal__toggle'], config.enabled && styles['speed-trainer-modal__toggle--active'])}
              onClick={handleToggle}
            >
              <div className={styles['speed-trainer-modal__toggle-knob']} />
            </div>
          </div>

          <div className={styles['speed-trainer-modal__divider']} />

          <div className={styles['speed-trainer-modal__row']}>
            <span className={styles['speed-trainer-modal__label']}>{t.everyMeasures[language]}</span>
            <input
              type="number"
              className={styles['speed-trainer-modal__input']}
              value={config.everyMeasures}
              onChange={(e) => handleChange('everyMeasures', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={32}
            />
          </div>

          <div className={styles['speed-trainer-modal__row']}>
            <span className={styles['speed-trainer-modal__label']}>{t.incrementBpm[language]}</span>
            <input
              type="number"
              className={styles['speed-trainer-modal__input']}
              value={config.increment}
              onChange={(e) => handleChange('increment', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={50}
            />
          </div>

          <div className={styles['speed-trainer-modal__row']}>
            <span className={styles['speed-trainer-modal__label']}>{t.targetBpm[language]}</span>
            <input
              type="number"
              className={styles['speed-trainer-modal__input']}
              value={config.targetBpm}
              onChange={(e) => handleChange('targetBpm', Math.max(currentBpm, parseInt(e.target.value) || 200))}
              min={currentBpm}
              max={300}
            />
          </div>

          {/* Status section - always rendered to prevent height changes */}
          <div className={styles['speed-trainer-modal__divider']} style={{ opacity: config.enabled ? 1 : 0 }} />
          <div 
            className={styles['speed-trainer-modal__status']} 
            style={{ opacity: config.enabled ? 1 : 0, pointerEvents: config.enabled ? 'auto' : 'none' }}
          >
            <div className={styles['speed-trainer-modal__status-text']}>
              {hasReachedTarget ? (
                <>{t.reachedTarget[language]} <span className={styles['speed-trainer-modal__status-highlight']}>{config.targetBpm} BPM</span></>
              ) : (
                <>
                  {measuresUntilNext} {t.measuresUntil[language]}<br />
                  BPM: {currentBpm} → <span className={styles['speed-trainer-modal__status-highlight']}>{Math.min(currentBpm + config.increment, config.targetBpm)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
