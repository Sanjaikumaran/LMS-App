import React from "react";
import styles from "./input.module.css";

const Input = ({
  label,
  labelClassName,
  type = "text",
  value,
  required = false,
  autoFocus = false,
  disabled = false,
  autoComplete,
  error,
  inputClassName = null,
  onChange,
  placeHolder = "Enter value",
  id,
  ...rest
}) => {
  const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.inputContainer}>
      {label && (
        <label htmlFor={inputId} className={labelClassName ?? styles.label}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        value={value}
        type={type}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeHolder}
        onChange={(e) => {
          onChange(e.target.value, e);
        }}
        className={`${inputClassName ?? styles.input} ${
          error ? styles.errorBorder : styles.normalBorder
        } ${disabled && styles.disabledInput}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />

      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
