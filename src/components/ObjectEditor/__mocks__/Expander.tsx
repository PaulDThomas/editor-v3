import { useCallback, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface ExpanderProps extends React.HTMLAttributes<HTMLDivElement> {
  lineChild: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  disabled?: boolean;
}

type ExpanderState = "open" | "closed";

export const Expander = ({
  lineChild,
  children,
  open = false,
  disabled = false,
  ...rest
}: ExpanderProps) => {
  const [expanded, setExpanded] = useState<ExpanderState>(open ? "open" : "closed");

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      switch (expanded) {
        case "closed":
          setExpanded("open");
          break;
        case "open":
          setExpanded("closed");
          break;
      }
    },
    [expanded],
  );

  return (
    <div
      {...rest}
      className={[
        baseStyles.expander,
        baseStyles[expanded],
        disabled ? baseStyles.disabled : "",
        ...(rest.className ?? ""),
      ].join(" ")}
      onClick={toggle}
    >
      <div className={baseStyles.holder}>{lineChild}</div>
      {expanded !== "closed" && <div className={baseStyles.expanderContent}>{children}</div>}
    </div>
  );
};

Expander.displayName = "Expander";
