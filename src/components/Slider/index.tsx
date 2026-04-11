import clsx from "clsx";
import React, { forwardRef } from "react";
import styles from "./styles.module.css";

export type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const toNumber = (
  value: React.InputHTMLAttributes<HTMLInputElement>["value"],
  fallback: number
) => {
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, defaultValue, max = 100, min = 0, style, value, ...props }, ref) => {
    const minValue = typeof min === "number" ? min : Number(min);
    const maxValue = typeof max === "number" ? max : Number(max);
    const currentValue = toNumber(value ?? defaultValue, minValue);
    const span = maxValue - minValue;
    const progress =
      !Number.isFinite(span) || span <= 0
        ? 0
        : Math.min(100, Math.max(0, ((currentValue - minValue) / span) * 100));

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        defaultValue={defaultValue}
        value={value}
        className={clsx(styles.slider, className)}
        style={{ "--slider-progress": `${progress}%`, ...style } as React.CSSProperties}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";
