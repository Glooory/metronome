import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Gauge, GripVertical, HelpCircle, ListMusic, MousePointerClick, Music2, Star, VolumeX, X } from 'lucide-react';
import type { Language } from '../../i18n';
import { translations } from '../../i18n';
import styles from './styles.module.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal = ({ isOpen, onClose, language }: HelpModalProps) => {
  if (!isOpen) return null;

  const t = translations.help;
  
  return (
    <div className={styles['help-modal']} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={styles['help-modal__content']}
      >
        <div className={styles['help-modal__header']}>
          <div className={styles['header-title-wrapper']}>
            <HelpCircle className={styles.icon} size={20} />
            <h2 className={styles['help-modal__title']}>{t.title[language]}</h2>
          </div>
          <button onClick={onClose} className={styles['help-modal__close-btn']}>
            <X size={20} />
          </button>
        </div>
        
        <div className={clsx(styles['help-modal__body'], "custom-scrollbar")}>
          {/* BPM Control */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><GripVertical size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.bpmControl[language]}</h3>
              <p className={styles['section-text']}>
                {t.bpmControlDesc[language]}<br/>
                <span className={styles['text-xs']}>{t.bpmControlKeys[language]}</span>
              </p>
            </div>
          </div>

          {/* BPM Memory */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Star size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.bpmMemory[language]}</h3>
              <p className={styles['section-text']}>{t.bpmMemoryDesc[language]}</p>
            </div>
          </div>

          {/* Beat Bars */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><MousePointerClick size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.beatBars[language]}</h3>
              <p className={styles['section-text']}>
                {t.beatBarsDesc[language]}<br/>
                <strong>{t.beatBarsLegend[language]}</strong>
              </p>
            </div>
          </div>

          {/* Speed Trainer */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Gauge size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.speedTrainer[language]}</h3>
              <p className={styles['section-text']}>{t.speedTrainerDesc[language]}</p>
            </div>
          </div>

          {/* Rhythm Trainer */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><VolumeX size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.rhythmTrainer[language]}</h3>
              <p className={styles['section-text']}>{t.rhythmTrainerDesc[language]}</p>
            </div>
          </div>

          {/* Presets */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><ListMusic size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.presetsFeature[language]}</h3>
              <p className={styles['section-text']}>{t.presetsDesc[language]}</p>
            </div>
          </div>

          {/* Bottom Dock */}
          <div className={styles['help-modal__row']}>
            <div className={styles['help-modal__icon-box']}><Music2 size={20} /></div>
            <div className="flex-1">
              <h3 className={styles['section-title']}>{t.bottomDock[language]}</h3>
              <p className={styles['section-text']}>{t.bottomDockDesc[language]}</p>
            </div>
          </div>
        </div>

        <div className={styles['help-modal__footer']}>
           <p className={styles['help-modal__footer-text']}>{t.footer[language]}</p>
        </div>
      </motion.div>
    </div>
  );
};
