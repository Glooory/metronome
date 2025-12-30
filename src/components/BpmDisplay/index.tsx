import { clsx } from "clsx";
import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp } from "lucide-react";
import { KeyboardEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { MAX_BPM, MIN_BPM } from "../../constants";
import styles from "./styles.module.css";

interface BpmDisplayProps {
  bpm: number;
  setBpm: (value: number | ((prev: number) => number)) => void;
}

export const BpmDisplay = ({ bpm, setBpm }: BpmDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(bpm));
  const [wheelOffset, setWheelOffset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startY = useRef<number | null>(null);
  const startBpm = useRef<number | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    setInputValue(String(bpm));
  }, [bpm]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const updateBpm = (delta: number) =>
    setBpm((prev) => Math.min(Math.max(prev + delta, MIN_BPM), MAX_BPM));
  const commitChange = () => {
    setIsEditing(false);
    let v = parseInt(inputValue, 10);
    if (isNaN(v)) v = bpm;
    else v = Math.max(MIN_BPM, Math.min(MAX_BPM, v));
    setBpm(v);
    setInputValue(String(v));
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") inputRef.current?.blur();
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".bpm-control-btn") || isEditing) return;
    e.preventDefault();
    startY.current = e.clientY;
    startBpm.current = bpm;
    hasMoved.current = false;
    document.body.style.cursor = "ns-resize";
    window.addEventListener("pointermove", handlePointerMove as any);
    window.addEventListener("pointerup", handlePointerUp);
  };
  const handlePointerMove = (e: globalThis.PointerEvent) => {
    if (startY.current === null) return;
    const deltaY = startY.current - e.clientY;
    if (Math.abs(deltaY) > 5) hasMoved.current = true;
    if (hasMoved.current && startBpm.current !== null) {
      const d = Math.round(deltaY * 0.5);
      setBpm(Math.min(Math.max(startBpm.current + d, MIN_BPM), MAX_BPM));
      setWheelOffset(-deltaY % 16);
    }
  };
  const handlePointerUp = () => {
    document.body.style.cursor = "default";
    window.removeEventListener("pointermove", handlePointerMove as any);
    window.removeEventListener("pointerup", handlePointerUp);
    if (!hasMoved.current) setIsEditing(true);
    startY.current = null;
    setWheelOffset(0);
  };
  const handleBtnClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    updateBpm(delta);
  };

  return (
    <div className={styles["bpm-display"]}>
      <div className={styles["bpm-display__resize-area"]}>
        <div className={styles["bpm-display__label"]}>
          <span>B</span>
          <span>P</span>
          <span>M</span>
        </div>
        <div
          className={styles["bpm-display__value-wrapper"]}
          onClick={() => !isEditing && setIsEditing(true)}
          style={{ cursor: "pointer" }}
        >
          <h1
            className={clsx(
              styles["bpm-display__value--main"],
              isEditing ? styles.hidden : styles.visible
            )}
          >
            {bpm}
          </h1>
          <h1
            className={clsx(
              styles["bpm-display__value--blur"],
              isEditing ? styles.hidden : styles.visible
            )}
          >
            {bpm}
          </h1>
          {isEditing && (
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitChange}
              onKeyDown={handleKeyDown}
              className={styles["bpm-display__input"]}
            />
          )}
        </div>
        <div className={styles["bpm-display__controls"]}>
          <div className={styles["bpm-display__buttons-col"]}>
            <button
              className={clsx("bpm-control-btn", styles["bpm-display__btn"])}
              onClick={(e) => handleBtnClick(e, 5)}
              disabled={bpm >= MAX_BPM}
            >
              <ChevronsUp size={20} />
            </button>
            <button
              className={clsx("bpm-control-btn", styles["bpm-display__btn"])}
              onClick={(e) => handleBtnClick(e, 1)}
              disabled={bpm >= MAX_BPM}
            >
              <ChevronUp size={20} />
            </button>
            <button
              className={clsx("bpm-control-btn", styles["bpm-display__btn"])}
              onClick={(e) => handleBtnClick(e, -1)}
              disabled={bpm <= MIN_BPM}
            >
              <ChevronDown size={20} />
            </button>
            <button
              className={clsx("bpm-control-btn", styles["bpm-display__btn"])}
              onClick={(e) => handleBtnClick(e, -5)}
              disabled={bpm <= MIN_BPM}
            >
              <ChevronsDown size={20} />
            </button>
          </div>
          <div
            className={styles["bpm-display__wheel"]}
            onPointerDown={handlePointerDown}
            title="Drag to adjust BPM"
            style={{ "--wheel-offset": `${wheelOffset}px` } as React.CSSProperties}
          >
            <div className={styles["bpm-display__wheel-lines"]}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
