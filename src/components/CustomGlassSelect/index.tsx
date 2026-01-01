import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

interface Option {
  label: string;
  value: any;
}

interface CustomGlassSelectProps {
  icon: LucideIcon;
  value: any;
  onChange: (value: any) => void;
  options: Option[];
  title: string;
  displayLabel: string;
  alignment?: "left" | "center" | "right";
  placement?: "top" | "bottom";
}

export const CustomGlassSelect = ({
  icon: Icon,
  value,
  onChange,
  options,
  title,
  displayLabel,
  alignment = "center",
  placement = "top",
}: CustomGlassSelectProps) => {
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
    <div className={styles["glass-select"]} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          styles["glass-select__btn"],
          isOpen ? styles["glass-select__btn--open"] : styles["glass-select__btn--closed"]
        )}
      >
        <Icon size={16} />
        <span className={styles["glass-select__label"]}>{displayLabel}</span>
        <div className={styles["glass-select__chevrons"]}>
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
              styles["glass-select__dropdown"],
              styles[`glass-select__dropdown--${alignment}`],
              styles[`glass-select__dropdown--${placement}`]
            )}
          >
            <div className={styles["glass-select__overlay"]} />
            <div className={styles["glass-select__dropdown-title"]}>{title}</div>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  styles["glass-select__option"],
                  opt.value === value && styles["glass-select__option--selected"]
                )}
              >
                {opt.label}
                {opt.value === value && (
                  <motion.div
                    layoutId={`dot-${title}`}
                    className={styles["glass-select__active-dot"]}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
