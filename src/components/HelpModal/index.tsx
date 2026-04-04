import {
  Activity,
  AudioWaveform,
  BarChart2,
  Command,
  Gauge,
  Grid,
  HelpCircle,
  Keyboard,
  ListMusic,
  MousePointerClick,
  Music,
  Palette,
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

  const HelpRow = ({
    icon: Icon,
    title,
    desc,
    legend,
  }: {
    icon: any;
    title: string;
    desc: string;
    legend?: string;
  }) => (
    <div className={styles["help-modal__row"]}>
      <div className={styles["help-modal__icon-box"]}>
        <Icon size={20} />
      </div>
      <div className={styles["help-modal__section-body"]}>
        <h3 className={styles["section-title"]}>{title}</h3>
        <p className={styles["section-text"]}>
          {desc}
          {legend && (
            <>
              <br />
              <strong className={styles["section-legend"]}>{legend}</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );

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
        <p className={styles["help-modal__intro"]}>{t.intro[language]}</p>

        <section className={styles["help-modal__section"]}>
          <h4 className={styles["help-modal__section-heading"]}>
            <Activity size={14} />
            {t.coreFeatures[language]}
          </h4>
          <HelpRow
            icon={Activity}
            title={t.bpmControl[language]}
            desc={t.bpmControlDesc[language]}
          />
          <HelpRow
            icon={MousePointerClick}
            title={t.tapTempo[language]}
            desc={t.tapTempoDesc[language]}
          />
          <HelpRow
            icon={Music}
            title={t.bpmNote[language]}
            desc={t.bpmNoteDesc[language]}
          />
          <HelpRow
            icon={BarChart2}
            title={t.beatBars[language]}
            desc={t.beatBarsDesc[language]}
            legend={t.beatBarsLegend[language]}
          />
          <HelpRow
            icon={Grid}
            title={t.subdivisions[language]}
            desc={t.subdivisionsDesc[language]}
          />
        </section>

        <section className={styles["help-modal__section"]}>
          <h4 className={styles["help-modal__section-heading"]}>
            <Gauge size={14} />
            {t.trainingTools[language]}
          </h4>
          <HelpRow
            icon={Gauge}
            title={t.speedTrainer[language]}
            desc={t.speedTrainerDesc[language]}
          />
          <HelpRow
            icon={VolumeX}
            title={t.intervalTrainer[language]}
            desc={t.intervalTrainerDesc[language]}
          />
          <HelpRow
            icon={AudioWaveform}
            title={t.swingTrainer[language]}
            desc={t.swingTrainerDesc[language]}
          />
        </section>

        <section className={styles["help-modal__section"]}>
          <h4 className={styles["help-modal__section-heading"]}>
            <Palette size={14} />
            {t.managementAndCustom[language]}
          </h4>
          <HelpRow icon={Star} title={t.bpmMemory[language]} desc={t.bpmMemoryDesc[language]} />
          <HelpRow
            icon={ListMusic}
            title={t.presetsFeature[language]}
            desc={t.presetsDesc[language]}
          />
        </section>

        <section className={styles["help-modal__shortcuts-card"]}>
          <div className={styles["shortcuts-card__header"]}>
            <Keyboard size={18} />
            <h4 className={styles["shortcuts-card__title"]}>{t.shortcutsTitle[language]}</h4>
          </div>
          <div className={styles["shortcuts-card__grid"]}>
            <div className={styles["shortcut-item"]}>
              <div className={styles["shortcut-keys"]}>
                <kbd className={styles["kbd-key"]}>Space</kbd>
              </div>
              <span className={styles["shortcut-text"]}>{t.spaceKey[language]}</span>
            </div>
            <div className={styles["shortcut-item"]}>
              <div className={styles["shortcut-keys"]}>
                <kbd className={styles["kbd-key"]}>↑</kbd>
                <kbd className={styles["kbd-key"]}>↓</kbd>
              </div>
              <span className={styles["shortcut-text"]}>{t.arrowKeys[language]}</span>
            </div>
          </div>
        </section>
      </div>

      <div className={styles["help-modal__footer"]}>
        <p className={styles["help-modal__footer-text"]}>
          <Command size={14} className={styles["footer-icon"]} />
          {t.footer[language]}
        </p>
      </div>
    </ModalShell>
  );
};
