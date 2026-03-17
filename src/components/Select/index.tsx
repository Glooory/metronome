import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  icon: LucideIcon;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  title: string;
  displayLabel: string;
  alignment?: "left" | "center" | "right";
  placement?: "top" | "bottom";
}

export const Select = ({
  icon: Icon,
  value,
  onChange,
  options,
  title,
  displayLabel,
  alignment = "center",
  placement = "top",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeDotId = useId();

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
    <div className={styles["select"]} ref={containerRef}>
      <Button
        variant="filled"
        isChecked={isOpen}
        className={styles["select__btn"]}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={20} />
        <span className={styles["select__label"]}>{displayLabel}</span>
        <div className={styles["select__chevrons"]}>
          <ChevronUp size={12} />
          <ChevronDown size={12} />
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: initialY }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: initialY }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={clsx(
              styles["select__dropdown"],
              styles[`select__dropdown--${alignment}`],
              styles[`select__dropdown--${placement}`]
            )}
          >
            <div className={styles["select__overlay"]} />
            <div className={styles["select__dropdown-title"]}>{title}</div>
            <div className={styles["select__options"]}>
              {options.map((opt) => (
                <Button
                  variant="transparent"
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    styles["select__option"],
                    opt.value === value && styles["select__option--selected"]
                  )}
                >
                  {opt.label}
                  {opt.value === value && (
                    <motion.div
                      layoutId={`dot-${activeDotId}`}
                      className={styles["select__active-dot"]}
                    />
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
