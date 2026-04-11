import { ListMusic, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Preset } from "../../constants";
import type { Language } from "../../i18n";
import { translations } from "../../i18n";
import { Button } from "../Button";
import { Input } from "../Input";
import { ModalShell } from "../ModalShell";
import styles from "./styles.module.css";

interface PresetsModalProps {
  isOpen: boolean;
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  language: Language;
}

export const PresetsModal = ({
  isOpen,
  presets,
  onSave,
  onLoad,
  onDelete,
  onClose,
  language,
}: PresetsModalProps) => {
  const [name, setName] = useState("");
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
  const tc = translations.common;
  const t = translations.presets;

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDeletingPresetId(null);
    }
  }, [isOpen]);

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
    <ModalShell
      isOpen={isOpen}
      title={t.title[language]}
      closeLabel={tc.close[language]}
      onClose={onClose}
      icon={ListMusic}
      panelClassName={styles["presets-modal__panel"]}
    >
      <div className={styles["presets-modal__content"]}>
        <div className={styles["presets-modal__save-section"]}>
          <Input
            type="text"
            className={styles["presets-modal__name-input"]}
            fullWidth
            size="md"
            placeholder={t.inputPlaceholder[language]}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={30}
          />
          <Button
            className={styles["presets-modal__save-btn"]}
            size="md"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {t.saveCurrent[language]}
          </Button>
        </div>

        <div className={styles["presets-modal__divider"]} />

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
                    <span>
                      {preset.beatsPerMeasure}/{preset.beatUnit ?? 4}
                    </span>
                    <span>{formatDate(preset.createdAt)}</span>
                  </div>
                </div>
                <div className={styles["presets-modal__item-actions"]}>
                  <Button size="icon-sm" onClick={() => onLoad(preset)} title={tc.load[language]}>
                    <Play size={16} fill="currentColor" />
                  </Button>
                  <Button
                    size="icon-sm"
                    className={styles["presets-modal__item-delete-btn"]}
                    onClick={() => setDeletingPresetId(preset.id)}
                    title={tc.delete[language]}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPresetId && (
        <div
          className={styles["presets-modal__confirm-overlay"]}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles["presets-modal__confirm-dialog"]}>
            <div className={styles["presets-modal__confirm-title"]}>
              {t.confirmDeleteTitle[language]}
            </div>
            <div className={styles["presets-modal__confirm-message"]}>
              {t.confirmDeleteMessage[language]}
            </div>
            <div className={styles["presets-modal__confirm-actions"]}>
              <Button
                className={styles["presets-modal__confirm-btn-cancel"]}
                onClick={() => setDeletingPresetId(null)}
              >
                {t.cancel[language]}
              </Button>
              <Button
                className={styles["presets-modal__confirm-btn-delete"]}
                onClick={() => {
                  if (deletingPresetId) {
                    onDelete(deletingPresetId);
                    setDeletingPresetId(null);
                  }
                }}
              >
                {t.confirm[language]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
