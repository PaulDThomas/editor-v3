import { useEffect, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface BaseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  value: string | number | undefined;
  availableOptions: {
    label: string;
    value: string | number | boolean | undefined;
    disabled?: boolean;
  }[];
  change: (ret: string | number | boolean | undefined) => void;
  label?: string;
}

export const BaseSelect = ({
  id,
  value,
  availableOptions,
  change,
  label,
  ...rest
}: BaseSelectProps): JSX.Element => {
  const [thisValueString, setThisValueString] = useState(`${value}`);
  useEffect(() => {
    const ix = availableOptions.findIndex((o) => o.value === value);
    setThisValueString(`${ix !== -1 ? `${ix}-` : ""}${value}`);
  }, [availableOptions, value]);

  const availableOptionsStrings = availableOptions.map((item, ix) => ({
    label: item.label,
    value: `${ix}-${item.value?.toString() ?? "undefined"}`,
    disabled: item.disabled,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newValueIx = availableOptionsStrings.findIndex((item) => item.value === e.target.value);
    setThisValueString(e.target.value);
    if (newValueIx !== -1) {
      change(availableOptions[newValueIx].value);
    }
  };

  return (
    <div className={baseStyles.holder}>
      {label !== undefined && (
        <label
          className={baseStyles.label}
          id={`${id}-label`}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <select
        {...rest}
        id={id}
        className={baseStyles.baseSelect}
        value={thisValueString}
        onChange={handleChange}
      >
        {availableOptions.findIndex((o) => o.value === value) === -1 && (
          <option
            value={thisValueString}
            disabled
          >
            {thisValueString}
          </option>
        )}
        {availableOptionsStrings.map((o, ix) => (
          <option
            key={`${ix}-${o.value}`}
            value={o.value}
            disabled={o.disabled}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

BaseSelect.displayName = "BaseSelect";
