import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

interface Option {
  label: string;
  value: any;
}

interface CustomSelectProps {
  icon: LucideIcon;
  value: any;
  onChange: (value: any) => void;
  options: Option[];
  title: string;
  displayLabel: string;
  alignment?: "left" | "center" | "right";
  placement?: "top" | "bottom";
}

export const CustomSelect = ({
  icon: Icon,
  value,
  onChange,
  options,
  title,
  displayLabel,
  alignment = "center",
  placement = "top",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initialY = placement === "top" ? 10 : -10;

  return (
    <div className={styles["custom-select"]} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          styles["custom-select__btn"],
          isOpen ? styles["custom-select__btn--open"] : styles["custom-select__btn--closed"]
        )}
      >
        <Icon size={20} />
        <span className={styles["custom-select__label"]}>{displayLabel}</span>
        <div className={styles["custom-select__chevrons"]}>
          <ChevronUp size={12} />
          <ChevronDown size={12} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: initialY }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: initialY }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={clsx(
              styles["custom-select__dropdown"],
              styles[`custom-select__dropdown--${alignment}`],
              styles[`custom-select__dropdown--${placement}`]
            )}
          >
            <div className={styles["custom-select__overlay"]} />
            <div className={styles["custom-select__dropdown-title"]}>{title}</div>
            <div className={styles["custom-select__options"]}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    styles["custom-select__option"],
                    opt.value === value && styles["custom-select__option--selected"]
                  )}
                >
                  {opt.label}
                  {opt.value === value && (
                    <motion.div
                      layoutId={`dot-${title}`}
                      className={styles["custom-select__active-dot"]}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
