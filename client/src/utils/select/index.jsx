import React, { useEffect, useState } from "react";
import styles from "./select.module.css";

const Dropdown = ({
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
  options = [],
  isOpen = false,
  searchable = false,
  onSelect,
  onBlur,
  onFocus,
  id,
  ...rest
}) => {
  const [showOptions, setShowOptions] = useState(isOpen);
  const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  const errorId = `${inputId}-error`;
  useEffect(()=>{

  },[value])

  return (
    <div className={styles.inputContainer} style={{ position: "relative" }}>
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
        onFocus={(e) => {
          setShowOptions(true);
          onFocus && onFocus(e);
        }}
        onBlur={(e) => {

          setTimeout(() => setShowOptions(false), 100);
          onBlur && onBlur(e);
        }}
        readOnly={searchable ? false : true}
        className={`${inputClassName ?? styles.input} ${error ? styles.errorBorder : styles.normalBorder} ${disabled && styles.disabledInput}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />

      {showOptions && options.length > 0 && (
        <div className={styles.optionsContainer}>
          {options.map((option, index) => ( option &&
            <span
              key={`${option}-${index}`}
              onClick={() => {
                onSelect && onSelect(option);
                setShowOptions(false);
              }}
              className={styles.optionItem}
            >
              {option}
            </span>
          ))}
        </div>
      )}

      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dropdown;
