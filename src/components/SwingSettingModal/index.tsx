import { motion } from "framer-motion";
import { RefreshCcw, X, Zap } from "lucide-react";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import styles from "./styles.module.css";

interface SwingSettingModalProps {
  swing: number;
  onSwingChange: (val: number) => void;
  onClose: () => void;
  language: Language;
}

export const SwingSettingModal = ({
  swing,
  onSwingChange,
  onClose,
  language,
}: SwingSettingModalProps) => {
  const t = translations.swingTrainer;

  const handleReset = () => {
    onSwingChange(0);
  };

  return (
    <motion.div
      className={styles["swing-trainer-modal__overlay"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles["swing-trainer-modal"]}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["swing-trainer-modal__header"]}>
          <div className={styles["swing-trainer-modal__title"]}>
            <Zap size={20} className={styles["swing-trainer-modal__title-icon"]} />
            {t.title[language]}
          </div>
          <button className={styles["swing-trainer-modal__close-btn"]} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles["swing-trainer-modal__content"]}>
          <div className={styles["swing-trainer-modal__section"]}>
            <div className={styles["swing-trainer-modal__label-row"]}>
              <span className={styles["swing-trainer-modal__label"]}>{t.swing[language]}</span>
              <span className={styles["swing-trainer-modal__value"]}>{swing}%</span>
            </div>
            <div className={styles["swing-trainer-modal__desc"]}>{t.swingDesc[language]}</div>
            <div className={styles["swing-trainer-modal__slider-container"]}>
              <input
                type="range"
                min="0"
                max="100"
                value={swing}
                onChange={(e) => onSwingChange(Number(e.target.value))}
                className={styles["swing-trainer-modal__slider"]}
              />
            </div>
          </div>
          <button className={styles["swing-trainer-modal__reset-btn"]} onClick={handleReset}>
            <RefreshCcw
              size={14}
              style={{
                verticalAlign: "text-bottom",
                marginRight: 6,
                transform: "translateY(1px)",
              }}
            />
            {t.reset[language]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
