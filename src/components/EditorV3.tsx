import { ContextMenuHandler, MenuItem } from "@asup/context-menu";
import { isEqual } from "lodash";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";
import {
  EditorV3Align,
  EditorV3ContentProps,
  EditorV3LineImport,
  EditorV3Position,
  EditorV3Styles,
} from "../classes/interface";
import { IMarkdownSettings, defaultMarkdownSettings } from "../classes/markdown/MarkdownSettings";
import { applyStylesToHTML } from "../functions/applyStylesToHTML";
import { getCaretPosition } from "../functions/getCaretPosition";
import { moveCursor } from "../functions/moveCursor";
import { redraw } from "../functions/redraw";
import { setCaretPosition } from "../functions/setCaretPosition";
import { useDebounceStack } from "../hooks/useDebounceStack";
import "./EditorV3.css";

interface EditorV3Props {
  id: string;
  input: string;
  editable?: boolean;
  setHtml?: (ret: string) => void;
  setText?: (ret: string) => void;
  setJson?: (ret: string) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
  resize?: boolean;
  spellCheck?: boolean;
  styleOnContextMenu?: boolean;
  allowMarkdown?: boolean;
  markdownSettings?: IMarkdownSettings;
}

interface EditorV3State {
  content: EditorV3Content;
  pos: EditorV3Position | null;
  contentProps: EditorV3ContentProps;
}

export const EditorV3 = ({
  id,
  input,
  editable = true,
  setText,
  setHtml,
  setJson,
  customStyleMap,
  allowNewLine = false,
  textAlignment = EditorV3Align.left,
  decimalAlignPercent = 60,
  style,
  resize = false,
  spellCheck = false,
  styleOnContextMenu = true,
  allowMarkdown = false,
  markdownSettings = defaultMarkdownSettings,
  ...rest
}: EditorV3Props): JSX.Element => {
  // Set up reference to inner div
  const divRef = useRef<HTMLDivElement | null>(null);
  const [inputDecode, setInputDecode] = useState<EditorV3State>({
    content: new EditorV3Content(input, {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
      showMarkdown: false,
      markdownSettings,
    }),
    pos: null,
    contentProps: {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
      showMarkdown: false,
      markdownSettings,
    },
  });

  // General return function
  const returnData = useCallback(
    (ret: EditorV3State) => {
      // Redraw dummay for information
      const dummyNode = document.createElement("div");
      redraw(dummyNode, ret.content, false, markdownSettings);
      const html = dummyNode.innerHTML ?? "";
      const text = ret.content.text;
      const json = ret.content.jsonString;
      if (text !== input && html !== input && json !== input) {
        setText && setText(text);
        setHtml && setHtml(html);
        setJson && setJson(json);
      }
      dummyNode.remove();
    },
    [input, markdownSettings, setHtml, setJson, setText],
  );

  // Redraw element
  const redrawElement = useCallback((ret: EditorV3State) => {
    if (divRef.current) {
      redraw(
        divRef.current,
        ret.content,
        ret.contentProps.showMarkdown ?? false,
        ret.contentProps.markdownSettings ?? defaultMarkdownSettings,
      );
      if (ret.pos) setCaretPosition(divRef.current, ret.pos);
    }
  }, []);
  const {
    currentValue,
    setCurrentValue,
    undo,
    redo,
    forceUpdate: forceReturn,
  } = useDebounceStack<EditorV3State>(inputDecode, setInputDecode, null, redrawElement, returnData);
  const content = currentValue?.content;
  const contentProps = currentValue?.contentProps;

  // Update text alignment from parent
  useEffect(() => {
    if (content && contentProps && textAlignment !== contentProps?.textAlignment) {
      content.textAlignment = textAlignment;
      setCurrentValue({
        content,
        pos: null,
        contentProps: {
          ...contentProps,
          textAlignment,
        },
      });
    }
  });

  // Update decimal alignment from parent
  useEffect(() => {
    if (content && contentProps && decimalAlignPercent !== contentProps?.decimalAlignPercent) {
      content.decimalAlignPercent = decimalAlignPercent;
      setCurrentValue({
        content,
        pos: null,
        contentProps: {
          ...contentProps,
          decimalAlignPercent,
        },
      });
    }
  });

  // Update styles from parent
  useEffect(() => {
    if (content && contentProps && !isEqual(customStyleMap, contentProps?.styles)) {
      content.styles = customStyleMap ?? {};
      setCurrentValue({
        content,
        pos: null,
        contentProps: {
          ...contentProps,
          styles: customStyleMap,
        },
      });
    }
  });

  // Update markdown settings from parent
  useEffect(() => {
    if (content && contentProps && !isEqual(markdownSettings, contentProps?.markdownSettings)) {
      content.markdownSettings = markdownSettings;
      setCurrentValue({
        content,
        pos: null,
        contentProps: {
          ...contentProps,
          markdownSettings,
        },
      });
    }
  });

  // Update input from parent, need to track the last string input separately from the debounce stack
  const [lastInput, setLastInput] = useState<string>(input);
  useEffect(() => {
    if (content && contentProps && input !== lastInput) {
      const newContent = new EditorV3Content(input, {
        textAlignment,
        decimalAlignPercent,
        styles: customStyleMap,
        showMarkdown: false,
        markdownSettings,
      });
      setCurrentValue({
        content: newContent,
        pos: null,
        contentProps,
      });
      setLastInput(input);
    }
  }, [
    content,
    contentProps,
    customStyleMap,
    decimalAlignPercent,
    input,
    lastInput,
    markdownSettings,
    setCurrentValue,
    textAlignment,
  ]);

  // Set up menu items
  const menuItems = useMemo((): MenuItem[] => {
    if (contentProps && content) {
      const styleMenuItem: MenuItem = {
        label: "Style",
        disabled: contentProps.showMarkdown,
        group: [
          ...(contentProps.styles && Object.keys(contentProps.styles).length > 0
            ? Object.keys(contentProps.styles ?? {}).map((s) => {
                return {
                  label: s,
                  disabled: contentProps.showMarkdown,
                  action: (target?: Range | null) => {
                    if (divRef.current) {
                      const content = new EditorV3Content(divRef.current.innerHTML, contentProps);
                      const pos = getCaretPosition(divRef.current, target);
                      if (pos) {
                        const newContent = content.applyStyle(s, pos);
                        const newPos = { ...pos, startLine: pos.endLine, startChar: pos.endChar };
                        setCurrentValue({
                          content: newContent,
                          pos: newPos,
                          contentProps,
                        });
                      }
                    }
                  },
                };
              })
            : [{ label: "No styles defined", disabled: true }]),
          {
            label: "Remove style",
            disabled: contentProps.showMarkdown,
            action: (target?: Range | null) => {
              if (divRef.current) {
                const content = new EditorV3Content(divRef.current.innerHTML, contentProps);
                const pos = getCaretPosition(divRef.current, target);
                if (pos) {
                  const newContent = content.removeStyle(pos);
                  const newPos = { ...pos, startLine: pos.endLine, startChar: pos.endChar };
                  setCurrentValue({
                    content: newContent,
                    pos: newPos,
                    contentProps,
                  });
                }
              }
            },
          },
        ],
      };
      const showMarkdownMenu = !allowMarkdown
        ? []
        : [
            {
              label: `${contentProps.showMarkdown ? "Hide" : "Show"} markdown`,
              action: () => {
                if (divRef.current) {
                  const content = new EditorV3Content(divRef.current.innerHTML, contentProps);
                  setCurrentValue({
                    content,
                    pos: null,
                    contentProps: {
                      ...contentProps,
                      showMarkdown: !contentProps.showMarkdown,
                    },
                  });
                }
              },
            },
          ];
      return [styleMenuItem, ...showMarkdownMenu];
    }
    return [];
  }, [allowMarkdown, content, contentProps, setCurrentValue]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    if (divRef.current && content && contentProps) {
      setInFocus(true);
      const pos = getCaretPosition(divRef.current);
      setCurrentValue({
        content,
        pos,
        contentProps,
      });
    }
  }, [content, contentProps, setCurrentValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (divRef.current && content && contentProps && !contentProps.showMarkdown) {
        // Handle undo/redo
        if (e.ctrlKey && e.code === "KeyZ") {
          e.stopPropagation();
          e.preventDefault();
          undo();
        } else if (e.ctrlKey && e.code === "KeyY") {
          e.stopPropagation();
          e.preventDefault();
          redo();
        } else if (e.ctrlKey && e.code === "KeyA") {
          e.stopPropagation();
          e.preventDefault();
          setCaretPosition(divRef.current, {
            startLine: 0,
            startChar: 0,
            isCollapsed: false,
            endLine: content.lines.length - 1,
            endChar: content.lines[content.lines.length - 1].lineLength,
          });
        } else {
          // Get current information
          const content = new EditorV3Content(divRef.current.innerHTML, contentProps);
          let pos = getCaretPosition(divRef.current);

          // Handle awkward keys
          if (
            divRef.current &&
            pos &&
            (["Backspace", "Delete"].includes(e.key) || (allowNewLine && e.key === "Enter"))
          ) {
            e.stopPropagation();
            e.preventDefault();
            const newPos =
              e.key === "Enter"
                ? content.splitLine(pos)
                : content.deleteCharacter(pos, e.key === "Backspace");
            setCurrentValue({ content, pos: newPos, contentProps });
            return;
          }
          // Cursor movement
          else if (
            divRef.current &&
            pos &&
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)
          ) {
            e.stopPropagation();
            e.preventDefault();
            pos = moveCursor(content, pos, e);
            setCurrentValue({
              content,
              pos,
              contentProps,
            });
          }
        }
      }
    },
    [allowNewLine, content, contentProps, redo, setCurrentValue, undo],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Markdown editing should not be handled
      if (contentProps && !contentProps.showMarkdown) {
        // Stop handled keys
        if (
          [
            "Enter",
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ].includes(e.code) ||
          (["KeyA", "KeyY", "KeyZ"].includes(e.code) && e.ctrlKey)
        ) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        // Always set new content value
        else if (divRef.current) {
          e.preventDefault();
          e.stopPropagation();
          const newContent = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          const newPos = getCaretPosition(divRef.current);
          setCurrentValue({
            content: newContent,
            pos: newPos,
            contentProps,
          });
        }
      }
    },
    [contentProps, customStyleMap, decimalAlignPercent, setCurrentValue, textAlignment],
  );

  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (contentProps && !contentProps.showMarkdown && divRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const pos = getCaretPosition(divRef.current);
        if (pos) {
          const content = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          const toPaste = content.subLines(pos);
          e.clipboardData.setData("text/plain", toPaste.map((l) => l.lineText).join("\n"));
          e.clipboardData.setData(
            "text/html",
            toPaste.map((l) => applyStylesToHTML(l.toHtml(), content.styles).outerHTML).join(""),
          );
          e.clipboardData.setData("data/aiev3", JSON.stringify(toPaste));
          if (e.type === "cut") {
            content.splice(pos);
            setCurrentValue({
              content,
              pos: {
                ...pos,
                endLine: pos.startLine,
                endChar: pos.startChar,
              },
              contentProps,
            });
          }
        }
      }
    },
    [contentProps, customStyleMap, decimalAlignPercent, setCurrentValue, textAlignment],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      try {
        if (divRef.current && contentProps) {
          e.preventDefault();
          e.stopPropagation();
          const pos = getCaretPosition(divRef.current);
          if (pos) {
            const content = new EditorV3Content(divRef.current.innerHTML, {
              textAlignment,
              decimalAlignPercent,
              styles: customStyleMap,
            });
            const lines: EditorV3Line[] = [];
            const linesImport = (
              e.clipboardData.getData("data/aiev3") !== ""
                ? JSON.parse(e.clipboardData.getData("data/aiev3"))
                : e.clipboardData
                    .getData("text/plain")
                    .split("\n")
                    .map((t) => ({
                      textBlocks: [{ text: t }],
                      textAlignment,
                      decimalAlignPercent,
                    }))
            ) as EditorV3LineImport[];
            // Just text blocks if only one line is allowed
            if (linesImport.length > 1 && !allowNewLine) {
              const textBlocks: EditorV3TextBlock[] = linesImport
                .flatMap((l) => l.textBlocks)
                .map((tb) => new EditorV3TextBlock(tb));
              lines.push(
                new EditorV3Line(
                  textBlocks,
                  linesImport[0].textAlignment as EditorV3Align,
                  linesImport[0].decimalAlignPercent,
                ),
              );
            } else {
              lines.push(...linesImport.map((l) => new EditorV3Line(JSON.stringify(l))));
            }
            // Splice in new data and set new content
            content.splice(pos, lines);
            pos.startLine = pos.startLine + lines.length - 1;
            pos.startChar =
              lines.length === 1
                ? pos.startChar + lines[0].lineLength
                : lines[lines.length - 1].lineLength;
            setCurrentValue({
              content,
              pos: {
                ...pos,
                endLine: pos.startLine,
                endChar: pos.startChar,
              },
              contentProps,
            });
          }
        }
      } catch (error) {
        throw new Error(`Paste failed because: ${error}`);
      }
    },
    [
      allowNewLine,
      contentProps,
      customStyleMap,
      decimalAlignPercent,
      setCurrentValue,
      textAlignment,
    ],
  );

  const handleBlur = useCallback(() => {
    setInFocus(false);
    forceReturn();
  }, [forceReturn]);

  const styleRecalc = useMemo(() => {
    const s = { ...style };
    // Remove padding/border width
    if (s.width) {
      s.width = `calc(${s.width} - 10px)`;
    }
    if (resize) {
      s.resize = "both";
      s.overflow = "auto";
    }
    return s;
  }, [resize, style]);

  return (
    <div
      {...rest}
      className={`aiev3${inFocus ? " editing" : ""}`}
      id={id}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <ContextMenuHandler
        menuItems={menuItems}
        style={{ width: "100%", height: "100%" }}
        showLowMenu={spellCheck || !styleOnContextMenu}
      >
        <div
          id={`${id}-editable`}
          className={`aiev3-editing ${allowNewLine ? "multiline" : "singleline"}`}
          style={styleRecalc}
          contentEditable={
            editable &&
            (typeof setHtml === "function" ||
              typeof setJson === "function" ||
              typeof setText === "function")
          }
          suppressContentEditableWarning
          role={
            editable &&
            (typeof setHtml === "function" ||
              typeof setJson === "function" ||
              typeof setText === "function")
              ? "textbox"
              : undefined
          }
          spellCheck={spellCheck}
          ref={divRef}
          onFocus={handleFocus}
          onKeyUpCapture={handleKeyUp}
          onCut={handleCopy}
          onCopy={handleCopy}
          onPasteCapture={handlePaste}
          onKeyDownCapture={handleKeyDown}
          onBlurCapture={handleBlur}
          onFocusCapture={handleFocus}
        />
      </ContextMenuHandler>
    </div>
  );
};

EditorV3.displayName = "AsupEditorV3";
