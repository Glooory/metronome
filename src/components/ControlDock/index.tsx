import { clsx } from "clsx";
import { ReactNode } from "react";
import styles from "./styles.module.css";

interface ControlDockProps {
  children: ReactNode;
  className?: string;
}

export const ControlDock = ({ children, className }: ControlDockProps) => (
  <div className={clsx(styles.dock, className)}>
    <div className={styles["dock__top-light"]} />
    {children}
  </div>
);
