import { clsx } from "clsx";
import { Star, X } from "lucide-react";
import { useRef } from "react";
import { translations, type Language } from "../../i18n";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface BpmFavoritesBarProps {
  currentBpm: number;
  setBpm: (value: number | ((prev: number) => number)) => void;
  favoriteBpms: number[];
  setFavoriteBpms: (value: number[] | ((prev: number[]) => number[])) => void;
  onTap: () => void;
  language: Language;
}

export const BpmFavoritesBar = ({
  currentBpm,
  setBpm,
  favoriteBpms,
  setFavoriteBpms,
  onTap,
  language,
}: BpmFavoritesBarProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const addFavoriteBpm = () => {
    setFavoriteBpms((prev: number[]) => {
      const filtered = prev.filter((b) => b !== currentBpm);
      return [currentBpm, ...filtered].slice(0, 20);
    });
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const removeFavoriteBpm = (e: React.MouseEvent, bpmToRemove: number) => {
    e.stopPropagation();
    setFavoriteBpms((prev: number[]) => prev.filter((b) => b !== bpmToRemove));
  };

  return (
    <div className={styles["favorites-bar"]}>
      <div ref={listRef} className={styles["favorites-bar__list"]}>
        {favoriteBpms.map((b) => (
          <div
            key={b}
            onClick={() => setBpm(b)}
            className={clsx(
              styles["favorites-bar__item"],
              b === currentBpm && styles["favorites-bar__item--active"]
            )}
          >
            <span className={styles["favorites-bar__item-text"]}>{b}</span>
            <Button
              noPadding
              size="icon-sm"
              classNames={{
                button: styles["favorites-bar__remove-btn"],
              }}
              onClick={(e) => removeFavoriteBpm(e, b)}
            >
              <X size={10} strokeWidth={3} />
            </Button>
          </div>
        ))}

        {favoriteBpms.length === 0 && (
          <span className={styles["favorites-bar__empty"]}>
            {translations.bpmFavorites.empty[language]}
          </span>
        )}
      </div>

      <Button size="icon" onClick={addFavoriteBpm} className={styles["favorites-bar__save-btn"]}>
        <Star size={18} fill="currentColor" />
      </Button>

      <Button size="icon" onClick={onTap} className={styles["favorites-bar__tap-btn"]}>
        <span className={styles["favorites-bar__tap-label"]}>
          {translations.bpmFavorites.tap[language]}
        </span>
      </Button>
    </div>
  );
};
