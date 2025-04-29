import React, { useEffect, useState } from "react";
import styles from "./button.module.css";

const Button = ({
  type = "button",
  children,
  className = false,
  onClick,
  shortcut = null,
  disabled = false,
  tooltip = false,
  isLoading = false,
  ...rest
}) => {
  const [finalTooltip, setFinalTooltip] = useState("");

  useEffect(() => {
    if (!onClick || !shortcut || disabled) return;
    console.log(shortcut);

    const handleShortcut = (e) => {
      console.log(e.key);
      if (e.key?.toLowerCase() === shortcut?.toLowerCase()) {
        e.preventDefault();
        onClick && onClick();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [shortcut, onClick, disabled]);

  useEffect(() => {
    if (tooltip && typeof tooltip === "string") {
      setFinalTooltip(tooltip);
    } else if (shortcut) {
      setFinalTooltip(shortcut);
    } else {
      setFinalTooltip("");
    }
  }, [tooltip, shortcut]);

  return (
    <div >
      <button
        type={type}
        className={`${className ? className : styles.button} ${
          finalTooltip ? styles.tooltip : ""
        } ${disabled ? styles.disabled : ""}`}
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...(finalTooltip ? { tooltip: finalTooltip } : {})}
        {...rest}
      >
        {isLoading && <span className={styles.spinner}></span>}
        <span className={isLoading ? styles.loadingText : ""}>{children}</span>
      </button>
    </div>
  );
};

export default Button;
