import { useCallback, useEffect, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface ExpanderProps extends React.HTMLAttributes<HTMLDivElement> {
  lineChild: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  timeMs?: number;
  disabled?: boolean;
  height?: number;
}

type ExpanderState = "open" | "closing" | "closed" | "placing" | "opening";

export const Expander = ({
  lineChild,
  children,
  open = false,
  timeMs = 300,
  height = 300,
  disabled = false,
  ...rest
}: ExpanderProps) => {
  const [expanded, setExpanded] = useState<ExpanderState>("closed");
  const [lastOpen, setLastOpen] = useState<boolean | null>(null);
  useEffect(() => {
    if (open !== lastOpen) {
      if (open) {
        setExpanded("placing");
      } else if (lastOpen !== null) {
        setExpanded("closing");
      }
      setLastOpen(open);
    }
  }, [expanded, open, lastOpen]);

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      switch (expanded) {
        case "closed":
          setExpanded("placing");
          break;
        case "open":
          setExpanded("closing");
          break;
      }
    },
    [expanded],
  );

  useEffect(() => {
    if (expanded === "placing") {
      setTimeout(() => {
        setExpanded("opening");
      }, 5);
    }
    if (expanded === "opening") {
      setTimeout(() => {
        setExpanded("open");
      }, timeMs);
    }
    if (expanded === "closing") {
      setTimeout(() => {
        setExpanded("closed");
      }, timeMs);
    }
  }, [expanded, timeMs]);

  return (
    <div
      {...rest}
      className={[
        baseStyles.expander,
        baseStyles[expanded],
        disabled ? baseStyles.disabled : "",
        ...(rest.className ?? ""),
      ].join(" ")}
      onClick={(e) => {
        if (
          !disabled &&
          e.target instanceof HTMLDivElement &&
          e.target.parentElement?.classList.contains(baseStyles.expander) &&
          e.target.classList.contains(baseStyles.holder)
        ) {
          toggle(e);
        }
      }}
    >
      <div className={baseStyles.holder}>{lineChild}</div>
      {expanded !== "closed" && (
        <div
          className={baseStyles.expanderContent}
          style={{
            transition: `min-height ${timeMs}ms ease-in-out, max-height ${timeMs}ms ease-in-out, opacity ${timeMs}ms ease-in-out`,
            maxHeight: ["open", "opening"].includes(expanded) ? `${height}px` : "0",
            minHeight: ["open", "opening"].includes(expanded) ? `${height}px` : "0",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

Expander.displayName = "Expander";
