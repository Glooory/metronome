import { clsx } from "clsx";
import { Star, X } from "lucide-react";
import { useRef } from "react";
import { translations, type Language } from "../../i18n";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface BpmHistoryBarProps {
  currentBpm: number;
  setBpm: (value: number | ((prev: number) => number)) => void;
  savedBpms: number[];
  setSavedBpms: (value: number[] | ((prev: number[]) => number[])) => void;
  onTap: () => void;
  language: Language;
}

export const BpmHistoryBar = ({
  currentBpm,
  setBpm,
  savedBpms,
  setSavedBpms,
  onTap,
  language,
}: BpmHistoryBarProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const saveCurrentBpm = () => {
    setSavedBpms((prev: number[]) => {
      const filtered = prev.filter((b) => b !== currentBpm);
      const newSaved = [currentBpm, ...filtered].slice(0, 20);
      return newSaved;
    });
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const removeBpm = (e: React.MouseEvent, bpmToRemove: number) => {
    e.stopPropagation();
    setSavedBpms((prev: number[]) => prev.filter((b) => b !== bpmToRemove));
  };

  return (
    <div className={styles["history-bar"]}>
      <div ref={listRef} className={styles["history-bar__list"]}>
        {savedBpms.map((b) => (
          <div
            key={b}
            onClick={() => setBpm(b)}
            className={clsx(
              styles["history-bar__item"],
              b === currentBpm && styles["history-bar__item--active"]
            )}
          >
            <span className={styles["history-bar__item-text"]}>{b}</span>
            <Button
              noPadding
              size="icon-sm"
              classNames={{
                button: styles["history-bar__remove-btn"],
              }}
              onClick={(e) => removeBpm(e, b)}
            >
              <X size={10} strokeWidth={3} />
            </Button>
          </div>
        ))}

        {savedBpms.length === 0 && (
          <span className={styles["no-history"]}>
            {translations.bpmHistory.noHistory[language]}
          </span>
        )}
      </div>

      <Button size="icon" onClick={saveCurrentBpm} className={styles["history-bar__save-btn"]}>
        <Star size={18} fill="currentColor" />
      </Button>

      <Button size="icon" onClick={onTap} className={styles["history-bar__tap-btn"]}>
        <span className={styles["history-bar__tap-label"]}>
          {translations.bpmHistory.tap[language]}
        </span>
      </Button>
    </div>
  );
};
