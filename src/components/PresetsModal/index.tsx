import { motion } from "framer-motion";
import { ListMusic, Play, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Preset } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import styles from "./styles.module.css";

interface PresetsModalProps {
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  language: Language;
}

export const PresetsModal = ({
  presets,
  onSave,
  onLoad,
  onDelete,
  onClose,
  language,
}: PresetsModalProps) => {
  const [name, setName] = useState("");
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
  const t = translations.presets;
  const tc = translations.common;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleSave();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <motion.div
      className={styles["presets-modal__overlay"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles["presets-modal"]}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["presets-modal__header"]}>
          <div className={styles["presets-modal__title"]}>
            <ListMusic size={20} className={styles["presets-modal__title-icon"]} />
            {t.title[language]}
          </div>
          <button className={styles["presets-modal__close-btn"]} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles["presets-modal__content"]}>
          {/* Save Current */}
          <div className={styles["presets-modal__save-section"]}>
            <input
              type="text"
              className={styles["presets-modal__name-input"]}
              placeholder={t.inputPlaceholder[language]}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
            />
            <button
              className={styles["presets-modal__save-btn"]}
              onClick={handleSave}
              disabled={!name.trim()}
            >
              {t.saveCurrent[language]}
            </button>
          </div>

          <div className={styles["presets-modal__divider"]} />

          {/* Presets List */}
          <div className={styles["presets-modal__list"]}>
            {presets.length === 0 ? (
              <div className={styles["presets-modal__empty-state"]}>
                <div className={styles["presets-modal__empty-icon"]}>📝</div>
                <div>
                  {t.emptyTitle[language]}
                  <br />
                  {t.emptyHint[language]}
                </div>
              </div>
            ) : (
              presets.map((preset) => (
                <div key={preset.id} className={styles["presets-modal__item"]}>
                  <div className={styles["presets-modal__item-info"]}>
                    <div className={styles["presets-modal__item-name"]}>{preset.name}</div>
                    <div className={styles["presets-modal__item-meta"]}>
                      <span>{preset.bpm} BPM</span>
                      <span>{preset.beatsPerMeasure}/4</span>
                      <span>{formatDate(preset.createdAt)}</span>
                    </div>
                  </div>
                  <div className={styles["presets-modal__item-actions"]}>
                    <button
                      className={`${styles["presets-modal__action-btn"]} ${styles["presets-modal__action-btn--load"]}`}
                      onClick={() => onLoad(preset)}
                      title={tc.load[language]}
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                    <button
                      className={`${styles["presets-modal__action-btn"]} ${styles["presets-modal__action-btn--delete"]}`}
                      onClick={() => setDeletingPresetId(preset.id)}
                      title={tc.delete[language]}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deletingPresetId && (
        <div className={styles["presets-modal__confirm-overlay"]} onClick={(e) => e.stopPropagation()}>
          <motion.div
            className={styles["presets-modal__confirm-dialog"]}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={styles["presets-modal__confirm-title"]}>
              {t.confirmDeleteTitle[language]}
            </div>
            <div className={styles["presets-modal__confirm-message"]}>
              {t.confirmDeleteMessage[language]}
            </div>
            <div className={styles["presets-modal__confirm-actions"]}>
              <button
                className={styles["presets-modal__confirm-btn-cancel"]}
                onClick={() => setDeletingPresetId(null)}
              >
                {t.cancel[language]}
              </button>
              <button
                className={styles["presets-modal__confirm-btn-delete"]}
                onClick={() => {
                  if (deletingPresetId) {
                    onDelete(deletingPresetId);
                    setDeletingPresetId(null);
                  }
                }}
              >
                {t.confirm[language]}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
