import { useCallback, useEffect, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value: string | number | undefined;
  onNewValue?: (ret: string | number) => void;
  label?: string;
}

export const BaseInput = ({
  id,
  value,
  onNewValue,
  label,
  ...rest
}: BaseInputProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>(value?.toString() ?? "");
  useEffect(() => {
    setInputValue(value?.toString() ?? "");
  }, [value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputBlur = useCallback(() => {
    if (onNewValue) {
      const newValue = typeof value === "number" ? parseFloat(inputValue) : inputValue;
      onNewValue(newValue);
    }
  }, [onNewValue, inputValue, value]);

  return (
    <div className={baseStyles.holder}>
      {label !== undefined && (
        <label
          id={`${id}-label`}
          className={baseStyles.label}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        {...rest}
        type={typeof value === "number" ? "number" : "text"}
        id={id}
        className={baseStyles.baseInput}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />
    </div>
  );
};

BaseInput.displayName = "BaseInput";
