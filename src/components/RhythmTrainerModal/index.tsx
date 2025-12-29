import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { VolumeX, X } from 'lucide-react';
import type { RhythmTrainerConfig } from '../../constants';
import type { Language } from '../../i18n';
import { translations } from '../../i18n';
import styles from './styles.module.css';

interface RhythmTrainerModalProps {
  config: RhythmTrainerConfig;
  onConfigChange: (config: RhythmTrainerConfig) => void;
  onClose: () => void;
  measureCount: number;
  isMuted: boolean;
  language: Language;
}

export const RhythmTrainerModal = ({
  config,
  onConfigChange,
  onClose,
  measureCount,
  isMuted,
  language,
}: RhythmTrainerModalProps) => {
  const t = translations.rhythmTrainer;

  const handleToggle = () => {
    onConfigChange({ ...config, enabled: !config.enabled });
  };

  const handleChange = (key: keyof RhythmTrainerConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  const cycleLength = config.playBars + config.muteBars;
  const positionInCycle = measureCount % cycleLength;
  const barsUntilChange = isMuted 
    ? config.muteBars - (positionInCycle - config.playBars)
    : config.playBars - positionInCycle;

  return (
    <motion.div
      className={styles['rhythm-trainer-modal__overlay']}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles['rhythm-trainer-modal']}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['rhythm-trainer-modal__header']}>
          <div className={styles['rhythm-trainer-modal__title']}>
            <VolumeX size={20} className={styles['rhythm-trainer-modal__title-icon']} />
            {t.title[language]}
          </div>
          <button className={styles['rhythm-trainer-modal__close-btn']} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles['rhythm-trainer-modal__content']}>
          <div className={styles['rhythm-trainer-modal__row']}>
            <span className={styles['rhythm-trainer-modal__label']}>{t.enableTraining[language]}</span>
            <div
              className={clsx(styles['rhythm-trainer-modal__toggle'], config.enabled && styles['rhythm-trainer-modal__toggle--active'])}
              onClick={handleToggle}
            >
              <div className={styles['rhythm-trainer-modal__toggle-knob']} />
            </div>
          </div>

          <div className={styles['rhythm-trainer-modal__divider']} />

          <div className={styles['rhythm-trainer-modal__row']}>
            <span className={styles['rhythm-trainer-modal__label']}>{t.playBars[language]}</span>
            <input
              type="number"
              className={styles['rhythm-trainer-modal__input']}
              value={config.playBars}
              onChange={(e) => handleChange('playBars', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={16}
            />
          </div>

          <div className={styles['rhythm-trainer-modal__row']}>
            <span className={styles['rhythm-trainer-modal__label']}>{t.muteBars[language]}</span>
            <input
              type="number"
              className={styles['rhythm-trainer-modal__input']}
              value={config.muteBars}
              onChange={(e) => handleChange('muteBars', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={16}
            />
          </div>

          {config.enabled && (
            <>
              <div className={styles['rhythm-trainer-modal__divider']} />
              <div className={clsx(styles['rhythm-trainer-modal__status'], isMuted && styles['rhythm-trainer-modal__status--muted'])}>
                <div className={styles['rhythm-trainer-modal__status-text']}>
                  {isMuted ? (
                    <>
                      <span className={clsx(styles['rhythm-trainer-modal__status-highlight'], styles['rhythm-trainer-modal__status-highlight--muted'])}>{t.muted[language]}</span><br />
                      {barsUntilChange} {t.untilResume[language]}
                    </>
                  ) : (
                    <>
                      <span className={styles['rhythm-trainer-modal__status-highlight']}>{t.playing[language]}</span><br />
                      {barsUntilChange} {t.untilMute[language]}
                    </>
                  )}
                </div>
              </div>
              <p className={styles['rhythm-trainer-modal__hint']}>
                {t.hint[language]}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
