import { useEffect } from "react";

// Custom hook to handle keyboard shortcuts
const useShortcut = (keyCombo, callback, targetRef = null, global = false) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keys = keyCombo.split("+");
      const isMatch = keys.every((key) => {
        if (key === "ctrl") return event.ctrlKey;
        if (key === "shift") return event.shiftKey;
        if (key === "alt") return event.altKey;
        if (key === "enter") return event.key === "Enter";
        if (key === "delete") return event.key === "Delete";
        if (key === "esc" || key === "escape") return event.key === "Escape";

        return event.key.toLowerCase() === key.toLowerCase();
      });

      if (isMatch) {
        if (
          global ||
          !targetRef ||
          targetRef.current?.contains(document.activeElement)
        ) {
          event.preventDefault();
          callback(event);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyCombo, callback, targetRef, global]);
};

export default useShortcut;
