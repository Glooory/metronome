import clsx from "clsx";
import React, { forwardRef } from "react";
import styles from "./styles.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: {
    button?: string;
    startIcon?: string;
    endIcon?: string;
  };
  /**
   * Visual style variant
   * @default 'filled'
   */
  variant?: "filled" | "outline" | "transparent";

  /**
   * Size of the button
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";

  /**
   * Whether the button is in a "toggled on" state (like checkbox/radio behavior)
   */
  isChecked?: boolean;

  /**
   * Whether the button has no padding
   */
  noPadding?: boolean;

  /**
   * Optional icon to render before children
   */
  startIcon?: React.ReactNode;

  /**
   * Optional icon to render after children
   */
  endIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      classNames,
      variant = "filled",
      size = "md",
      isChecked = false,
      noPadding = false,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          styles.button,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          noPadding && styles["no-padding"],
          className,
          classNames?.button
        )}
        aria-checked={isChecked}
        {...props}
      >
        {startIcon && <span className={clsx(styles.icon, classNames?.startIcon)}>{startIcon}</span>}
        {children}
        {endIcon && <span className={clsx(styles.icon, classNames?.endIcon)}>{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
