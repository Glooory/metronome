import {
  AudioWaveform,
  Gauge,
  GripVertical,
  HelpCircle,
  ListMusic,
  MousePointerClick,
  Music,
  Star,
  VolumeX,
} from "lucide-react";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { ModalShell } from "../ModalShell";
import styles from "./styles.module.css";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal = ({ isOpen, onClose, language }: HelpModalProps) => {
  const common = translations.common;
  const t = translations.help;

  return (
    <ModalShell
      isOpen={isOpen}
      title={t.title[language]}
      titleAs="h2"
      closeLabel={common.close[language]}
      onClose={onClose}
      icon={HelpCircle}
      overlayClassName={styles["help-modal__overlay"]}
      panelClassName={styles["help-modal__panel"]}
      headerClassName={styles["help-modal__header"]}
      titleRowClassName={styles["help-modal__title-row"]}
      titleClassName={styles["help-modal__title"]}
      titleIconClassName={styles["help-modal__title-icon"]}
    >
      <div className={styles["help-modal__body"]}>
        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <GripVertical size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.bpmControl[language]}</h3>
            <p className={styles["section-text"]}>
              {t.bpmControlDesc[language]}
              <br />
              <span className={styles["text-xs"]}>{t.bpmControlKeys[language]}</span>
            </p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <Star size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.bpmMemory[language]}</h3>
            <p className={styles["section-text"]}>{t.bpmMemoryDesc[language]}</p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <MousePointerClick size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.beatBars[language]}</h3>
            <p className={styles["section-text"]}>
              {t.beatBarsDesc[language]}
              <br />
              <strong>{t.beatBarsLegend[language]}</strong>
            </p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <Gauge size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.speedTrainer[language]}</h3>
            <p className={styles["section-text"]}>{t.speedTrainerDesc[language]}</p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <VolumeX size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.intervalTrainer[language]}</h3>
            <p className={styles["section-text"]}>{t.intervalTrainerDesc[language]}</p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <AudioWaveform size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.swingTrainer[language]}</h3>
            <p className={styles["section-text"]}>{t.swingTrainerDesc[language]}</p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <ListMusic size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.presetsFeature[language]}</h3>
            <p className={styles["section-text"]}>{t.presetsDesc[language]}</p>
          </div>
        </div>

        <div className={styles["help-modal__row"]}>
          <div className={styles["help-modal__icon-box"]}>
            <Music size={20} />
          </div>
          <div className={styles["help-modal__section-body"]}>
            <h3 className={styles["section-title"]}>{t.bottomDock[language]}</h3>
            <p className={styles["section-text"]}>{t.bottomDockDesc[language]}</p>
          </div>
        </div>
      </div>

      <div className={styles["help-modal__footer"]}>
        <p className={styles["help-modal__footer-text"]}>{t.footer[language]}</p>
      </div>
    </ModalShell>
  );
};
