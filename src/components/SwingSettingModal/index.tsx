import { AudioWaveform, RefreshCcw } from "lucide-react";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
import { ModalShell } from "../ModalShell";
import { Slider } from "../Slider";
import styles from "./styles.module.css";

interface SwingSettingModalProps {
  isOpen: boolean;
  swing: number;
  onSwingChange: (val: number) => void;
  onClose: () => void;
  language: Language;
}

export const SwingSettingModal = ({
  isOpen,
  swing,
  onSwingChange,
  onClose,
  language,
}: SwingSettingModalProps) => {
  const common = translations.common;
  const t = translations.swingTrainer;

  const handleReset = () => {
    onSwingChange(0);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      title={t.title[language]}
      closeLabel={common.close[language]}
      onClose={onClose}
      icon={AudioWaveform}
      panelClassName={styles["swing-trainer-modal__panel"]}
      headerClassName={styles["swing-trainer-modal__header"]}
    >
      <div className={styles["swing-trainer-modal__content"]}>
        <div className={styles["swing-trainer-modal__section"]}>
          <div className={styles["swing-trainer-modal__label-row"]}>
            <span className={styles["swing-trainer-modal__label"]}>{t.swing[language]}</span>
            <span className={styles["swing-trainer-modal__value"]}>{swing}%</span>
          </div>
          <div className={styles["swing-trainer-modal__desc"]}>{t.swingDesc[language]}</div>
          <div className={styles["swing-trainer-modal__slider-container"]}>
            <Slider
              min="0"
              max="100"
              value={swing}
              onChange={(e) => onSwingChange(Number(e.target.value))}
              className={styles["swing-trainer-modal__slider"]}
            />
          </div>
        </div>
        <Button
          className={styles["swing-trainer-modal__reset-btn"]}
          classNames={{ startIcon: styles["swing-trainer-modal__reset-icon"] }}
          startIcon={<RefreshCcw size={14} />}
          onClick={handleReset}
        >
          {t.reset[language]}
        </Button>
      </div>
    </ModalShell>
  );
};
