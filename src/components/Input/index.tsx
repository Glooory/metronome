import clsx from "clsx";
import React, { forwardRef } from "react";
import styles from "./styles.module.css";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  align?: "left" | "center" | "right";
  font?: "body" | "metric";
  fullWidth?: boolean;
  hideNumberSpinner?: boolean;
  size?: "sm" | "md";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      align = "left",
      className,
      font = "body",
      fullWidth = false,
      hideNumberSpinner = false,
      size = "md",
      ...props
    },
    ref
  ) => (
    <input
      ref={ref}
      className={clsx(
        styles.input,
        styles[`align-${align}`],
        styles[`font-${font}`],
        styles[`size-${size}`],
        fullWidth && styles["full-width"],
        hideNumberSpinner && styles["hide-number-spinner"],
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
