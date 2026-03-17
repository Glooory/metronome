import { clsx } from "clsx";
import React from "react";
import styles from "./styles.module.css";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className,
  disabled = false,
  "aria-label": ariaLabel,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={clsx(
        styles.checkbox,
        checked && styles["checkbox--checked"],
        disabled && styles["checkbox--disabled"],
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <div className={styles["checkbox__knob"]} />
    </div>
  );
};
