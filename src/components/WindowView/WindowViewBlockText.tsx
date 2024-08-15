import { useEffect, useId, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface WindowViewBlockTextProps extends React.ComponentProps<"input"> {
  label: string;
  disabled: boolean;
  text?: string;
  setText: (label: string) => void;
  grow?: boolean;
  shrink?: boolean;
}

export const WindowViewBlockText = ({
  label,
  text,
  setText,
  grow = false,
  shrink = false,
  ...rest
}: WindowViewBlockTextProps) => {
  const thisId = useId();
  const [currentText, setCurrentText] = useState<string>(text ?? "");
  useEffect(() => {
    setCurrentText(text ?? "");
  }, [text]);

  return (
    <div
      className={baseStyles.holder}
      style={{ flexGrow: grow ? 1 : undefined, flexShrink: shrink ? 1 : undefined, width: "auto" }}
    >
      <label
        id={`label-${thisId}`}
        className={baseStyles.label}
        htmlFor={thisId}
      >
        {label}
      </label>
      <input
        {...rest}
        aria-labelledby={`label-${thisId}`}
        id={thisId}
        className={baseStyles.baseInput}
        value={currentText}
        onChange={(e) => setCurrentText(e.currentTarget.value)}
        onBlur={() => setText(currentText)}
      />
    </div>
  );
};

WindowViewBlockText.displayName = "WindowViewBlockText";
