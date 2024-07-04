import baseStyles from "../BaseInputs.module.css";

interface BaseCheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
  id: string;
  checked: boolean;
  change: (ret: boolean) => void;
  label?: string;
}

export const BaseCheckbox = ({
  id,
  checked,
  change,
  label,
  ...rest
}: BaseCheckboxProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent<HTMLInputElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    change(!checked);
  };
  return (
    <div className={baseStyles.holder}>
      <input
        {...rest}
        type="checkbox"
        id={id}
        className={baseStyles.baseCheckbox}
        checked={checked}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleClick}
      />
      {label !== undefined && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className={baseStyles.baseCheckboxLabel}
          onClick={handleClick}
        >
          {label}
        </label>
      )}
    </div>
  );
};

BaseCheckbox.displayName = "BaseCheckbox";
