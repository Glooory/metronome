import { clsx } from "clsx";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type TransitionEvent } from "react";
import { Button } from "../Button";
import styles from "./styles.module.css";

interface Option {
  label: React.ReactNode;
  value: string | number;
}

interface SelectProps {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  title: string;
  displayLabel: React.ReactNode;
  alignment?: "left" | "center" | "right";
  placement?: "top" | "bottom";
  className?: string;
  buttonClassName?: string;
}

export const Select = ({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  value,
  onChange,
  options,
  title,
  displayLabel,
  alignment = "center",
  placement = "top",
  className,
  buttonClassName,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPresent) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(isOpen);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, isPresent]);

  const handleDropdownTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity" || isOpen) {
      return;
    }

    setIsPresent(false);
  };

  return (
    <div className={clsx(styles["select"], className)} ref={containerRef}>
      <Button
        variant="outline"
        isChecked={isOpen}
        className={clsx(styles["select__btn"], buttonClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {!!LeftIcon && <LeftIcon size={20} />}
        <span className={styles["select__label"]}>{displayLabel}</span>
        {!!RightIcon ? (
          <RightIcon size={20} />
        ) : (
          <div className={styles["select__chevrons"]}>
            <ChevronUp size={12} />
            <ChevronDown size={12} />
          </div>
        )}
      </Button>

      {isPresent && (
        <div
          data-state={isVisible ? "open" : "closed"}
          onTransitionEnd={handleDropdownTransitionEnd}
          className={clsx(
            styles["select__dropdown"],
            styles[`select__dropdown--${alignment}`],
            styles[`select__dropdown--${placement}`]
          )}
        >
          <div className={styles["select__overlay"]} />
          <div className={styles["select__dropdown-title"]}>{title}</div>
          <div className={styles["select__options"]}>
            <div className={styles["select__options-inner"]}>
              {options.map((opt) => (
                <Button
                  variant="transparent"
                  key={opt.value}
                  isChecked={opt.value === value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={styles["select__option"]}
                >
                  {opt.label}
                  {opt.value === value && <div className={styles["select__active-dot"]} />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
