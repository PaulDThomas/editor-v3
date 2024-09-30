import { useLayoutEffect, useState } from "react";
import baseStyles from "./BaseInputs.module.css";
import { EditorV3, EditorV3Props } from "./EditorV3";

interface BaseEdivotV3Props extends EditorV3Props {
  label?: string;
  errorText?: string;
}

export const BaseEditorV3 = ({
  label,
  errorText,
  style,
  resize,
  ...rest
}: BaseEdivotV3Props): JSX.Element => {
  const [outerStyle, setOuterStyle] = useState<React.CSSProperties>(style ?? {});
  const [innerStyle, setInnerStyle] = useState<React.CSSProperties>(style ?? {});
  useLayoutEffect(() => {
    const outer: React.CSSProperties = {};
    const inner: React.CSSProperties = { ...style };
    if (style) {
      if (style.width) {
        outer.width = style.width;
        inner.width = "100%";
      }
      if (style.maxWidth) {
        outer.maxWidth = style.maxWidth;
        inner.maxWidth = "100%";
      }
      if (style.minWidth) {
        outer.minWidth = style.minWidth;
        inner.minWidth = "100%";
      }
      if (style.height) {
        outer.height = style.height;
        inner.height = "100%";
      } else {
        outer.height = "calc(1.5em + 26px)";
        inner.height = "100%";
      }
      if (style.maxHeight) {
        outer.maxHeight = style.maxHeight;
        inner.maxHeight = "100%";
      }
      if (style.minHeight) {
        outer.minHeight = style.minHeight;
        inner.minHeight = "100%";
      } else {
        outer.minHeight = "calc(1.5em + 26px)";
        inner.minHeight = "100%";
      }
      if (resize === true || resize === "vertical") {
        outer.resize = "vertical";
        outer.overflow = "auto";
      }
    }
    setOuterStyle(outer);
    setInnerStyle(inner);
  }, [style, resize]);
  return (
    <div
      className={baseStyles.holder}
      style={outerStyle}
    >
      {label !== undefined && (
        <label
          className={baseStyles.label}
          id={`${rest.id}-label`}
          htmlFor={`${rest.id}`}
        >
          {label}
        </label>
      )}
      {errorText !== undefined && errorText.trim() !== "" && (
        <div className={baseStyles.errorText}>
          <>
            {errorText.split("\n").map((errorLine, ix) => (
              <div key={ix}>{errorLine}</div>
            ))}
          </>
        </div>
      )}
      <div className={baseStyles.editorHolder}>
        <EditorV3
          {...rest}
          aria-labelledby={`${rest.id}-label`}
          style={innerStyle}
          noBorder
          resize={false}
        />
      </div>
    </div>
  );
};
