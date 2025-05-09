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

    const normalizeKey = (key) => {
      const map = {
        ctrl: "control",
        control: "control",
        cmd: "meta",
        command: "meta",
        option: "alt",
        esc: "escape",
        del: "delete",
        return: "enter",
        win: "meta",
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        space: " ",
        plus: "+",
        minus: "-",
        tab: "tab",
        backspace: "backspace",
        enter: "enter",
        shift: "shift",
        alt: "alt",
        meta: "meta",
      };
      const cleaned = key.trim().toLowerCase();
      return map[cleaned] || cleaned;
    };

    const keys = shortcut.split("+").map(normalizeKey);

    const pressed = new Set();

    const downHandler = (e) => {
      pressed.add(e?.key?.toLowerCase());
      const allPressed = keys.every((k) => pressed.has(k));
      if (allPressed) {
        e.preventDefault();
        onClick();
      }
    };

    const upHandler = (e) => {
      pressed.delete(e?.key?.toLowerCase());
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
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
    <div className={styles.buttonContainer}>
      <button
        type={type}
        className={`${className && className} ${styles.button} ${
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
