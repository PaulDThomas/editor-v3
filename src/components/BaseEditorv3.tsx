import { useLayoutEffect, useState } from "react";
import baseStyles from "./BaseInputs.module.css";
import { EditorV3, EditorV3Props } from "./EditorV3";

interface BaseEdivotV3Props extends EditorV3Props {
  label?: string;
}

export const BaseEditorV3 = ({ label, style, resize, ...rest }: BaseEdivotV3Props): JSX.Element => {
  const [outerStyle, setOuterStyle] = useState<React.CSSProperties>(style ?? {});
  const [innerStyle, setInnerStyle] = useState<React.CSSProperties>(style ?? {});
  useLayoutEffect(() => {
    const recalc: React.CSSProperties = { ...style };
    const outer: React.CSSProperties = {};
    if (style) {
      if (style.width) {
        outer.width = style.width;
        recalc.width = "100%";
      }
      if (style.maxWidth) {
        outer.maxWidth = style.maxWidth;
        recalc.maxWidth = "100%";
      }
      if (style.minWidth) {
        outer.minWidth = style.minWidth;
        recalc.minWidth = "100%";
      }
      if (style.height) {
        outer.height = style.height;
        recalc.height = "100%";
      } else {
        outer.height = "48px";
        recalc.height = "100%";
      }
      if (style.maxHeight) {
        outer.maxHeight = style.maxHeight;
        recalc.maxHeight = "100%";
      }
      if (style.minHeight) {
        outer.minHeight = style.minHeight;
        recalc.minHeight = "100%";
      } else {
        outer.minHeight = "48px";
        recalc.minHeight = "100%";
      }
      if (resize === true || resize === "vertical") {
        outer.resize = "vertical";
        outer.overflow = "auto";
      }
    }
    setOuterStyle(outer);
    setInnerStyle(recalc);
  }, [style, resize]);
  return (
    <div
      className={baseStyles.holder}
      style={outerStyle}
    >
      {label !== undefined && (
        <label
          className={baseStyles.label}
          htmlFor={rest.id}
        >
          {label}
        </label>
      )}
      <div className={baseStyles.editorHolder}>
        <EditorV3
          {...rest}
          style={innerStyle}
          noBorder
          resize={false}
        />
      </div>
    </div>
  );
};
