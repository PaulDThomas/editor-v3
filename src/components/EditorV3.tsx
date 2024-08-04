import { ContextMenuHandler, MenuItem } from "@asup/context-menu";
import { cloneDeep, isEqual } from "lodash";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorV3AtBlock, EditorV3Line } from "../classes";
import { EditorV3Content } from "../classes/EditorV3Content";
import { defaultContentProps } from "../classes/defaultContentProps";
import { IMarkdownSettings } from "../classes/defaultMarkdownSettings";
import {
  EditorV3Align,
  EditorV3ContentPropsInput,
  EditorV3DropListItem,
  EditorV3Position,
  EditorV3Styles,
  IEditorV3,
} from "../classes/interface";
import { useDebounceStack } from "../hooks/useDebounceStack";
import "./EditorV3.css";
import { WindowView } from "./WindowView/WindowView";

export interface EditorV3Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  input: string | IEditorV3;
  editable?: boolean;
  setText?: (ret: string) => void;
  setObject?: (ret: IEditorV3) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
  resize?: boolean;
  noBorder?: boolean;
  spellCheck?: boolean;
  styleOnContextMenu?: boolean;
  allowMarkdown?: boolean;
  allowWindowView?: boolean;
  markdownSettings?: IMarkdownSettings;
  debounceMilliseconds?: number | null;
  atListFunction?: (at: string) => Promise<EditorV3DropListItem<Record<string, string>>[]>;
  maxAtListLength?: number;
}

export interface EditorV3State {
  content: EditorV3Content;
  focus: boolean;
}

export const EditorV3 = ({
  id,
  input,
  editable = true,
  setText,
  setObject,
  style,
  allowMarkdown = cloneDeep(defaultContentProps.allowMarkdown),
  allowWindowView = cloneDeep(defaultContentProps.allowWindowView),
  allowNewLine = cloneDeep(defaultContentProps.allowNewLine),
  decimalAlignPercent = cloneDeep(defaultContentProps.decimalAlignPercent),
  markdownSettings = cloneDeep(defaultContentProps.markdownSettings),
  customStyleMap,
  textAlignment = cloneDeep(defaultContentProps.textAlignment),
  resize = false,
  noBorder = false,
  spellCheck = false,
  styleOnContextMenu = true,
  debounceMilliseconds = null,
  atListFunction,
  maxAtListLength = 10,
  ...rest
}: EditorV3Props): JSX.Element => {
  // Set up reference to inner div
  const divRef = useRef<HTMLDivElement | null>(null);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  const [showWindowView, setShowWindowView] = useState<boolean>(false);
  const [inputDecode, setInputDecode] = useState<EditorV3State>({
    content: new EditorV3Content(input, {
      ...defaultContentProps,
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
      showMarkdown: false,
      markdownSettings,
      allowMarkdown,
      allowNewLine,
    }),
    focus: false,
  });

  const contentProps = useMemo((): EditorV3ContentPropsInput => {
    return {
      ...defaultContentProps,
      allowMarkdown,
      allowNewLine,
      decimalAlignPercent,
      styles: customStyleMap,
      markdownSettings,
      showMarkdown,
      textAlignment,
      atListFunction,
      maxAtListLength,
    };
  }, [
    allowMarkdown,
    allowNewLine,
    atListFunction,
    customStyleMap,
    decimalAlignPercent,
    markdownSettings,
    maxAtListLength,
    showMarkdown,
    textAlignment,
  ]);

  // General return function
  const [hasFocused, setHasFocused] = useState<boolean>(false);
  const [lastInput, setLastInput] = useState<string | IEditorV3>(input);
  const [lastCaretPosition, setLastCaretPosition] = useState<EditorV3Position | null>(null);
  const [lastAction, setLastAction] = useState<"Focus" | "Blur" | "Key" | "">("");
  const [lastTextSent, setLastTextSent] = useState<string>(
    typeof input === "object"
      ? input.lines.map((l) => l.textBlocks.map((tb) => tb.text).join("")).join("\n")
      : input,
  );
  const [lastObjectSent, setLastObjectSent] = useState<IEditorV3>(
    typeof input === "object"
      ? input
      : { lines: input.split("\n").map((l) => ({ textBlocks: [{ text: l }] })) },
  );

  const returnData = useCallback(
    (ret: EditorV3State) => {
      // Block return when there is an active at-block, or if the editor has never been focused
      if (
        !ret.content.lines.some((l) =>
          l.textBlocks.some((tb) => tb.type === "at" && !tb.isLocked),
        ) &&
        hasFocused
      ) {
        // Redraw dummy for information
        const dummyNode = document.createElement("div");
        ret.content.redraw(dummyNode, false);
        const text = ret.content.text;
        if (setText && text !== lastTextSent) {
          setText(text);
          setLastTextSent(text);
        }
        if (setObject && !isEqual(ret.content.data, lastObjectSent)) {
          setObject(ret.content.data);
          setLastObjectSent(ret.content.data);
        }
        dummyNode.remove();
      }
    },
    [hasFocused, lastObjectSent, lastTextSent, setObject, setText],
  );

  // Redraw element, used in debounced stack as onChange callback
  const redrawElement = useCallback((ret: EditorV3State) => {
    // console.debug(
    //   "Redraw element:\r\n",
    //   ret.content.lines.map((l) => l.toMarkdown({}).textContent).join("\n"),
    //   JSON.stringify(ret.content.caretPosition),
    // );
    divRef.current && ret.content.redraw(divRef.current, ret.focus);
  }, []);
  // Create debounce stack
  const {
    currentValue: state,
    setCurrentValue,
    undo,
    redo,
    forceUpdate: forceReturn,
  } = useDebounceStack<EditorV3State>(
    inputDecode,
    setInputDecode,
    debounceMilliseconds,
    redrawElement,
    returnData,
    (oldValue, newValue) =>
      isEqual(
        oldValue && [
          oldValue.content.lines.map((l) =>
            l.textBlocks.map((tb) => ({ ...tb.data, isLocked: undefined })),
          ),
        ],
        newValue && [
          newValue.content.lines.map((l) =>
            l.textBlocks.map((tb) => ({ ...tb.data, isLocked: undefined })),
          ),
        ],
      ),
  );
  // Utility callback for debugging
  const setContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (newContent: EditorV3Content, calledFrom?: string, focus?: boolean) => {
      // console.debug(
      //   "SetContent:" + calledFrom + ":\r\n",
      //   newContent.lines.map((l) => l.toMarkdown({}).textContent).join("\n"),
      // );
      setLastCaretPosition(newContent.caretPosition);
      setCurrentValue({
        content: newContent,
        focus: focus ?? state?.focus ?? false,
      });
    },
    [setCurrentValue, state],
  );

  // Update any content property from parent
  useEffect(() => {
    if (divRef.current && state && !isEqual(state.content.contentProps, contentProps)) {
      const newContent = new EditorV3Content(divRef.current, contentProps);
      setContent(newContent, "Update content props from parent");
    }
  });

  // Update input from parent, need to track the last string input separately from the debounce stack
  useEffect(() => {
    if (state && input !== lastInput) {
      const newContent = new EditorV3Content(input, contentProps);
      // Lock any at-blocks here, focus must have been lost
      newContent.lines.forEach((l) => {
        l.textBlocks.forEach((tb) => {
          if (tb.type === "at") {
            tb.isLocked = true;
          }
        });
      });
      if (lastAction !== "Blur") newContent.caretPosition = lastCaretPosition;
      setContent(newContent, "Update input from parent");
      setLastInput(input);
    }
  }, [
    state,
    contentProps,
    input,
    lastAction,
    lastCaretPosition,
    lastInput,
    redrawElement,
    setContent,
  ]);

  // Set up menu items
  const menuItems = useMemo((): MenuItem[] => {
    if (state) {
      const styleMenuItem: MenuItem[] =
        !state.content.styles || Object.keys(state.content.styles).length === 0
          ? []
          : [
              {
                label: "Style",
                disabled: state.content.showMarkdown,
                group: [
                  ...Object.keys(state.content.styles).map((s) => {
                    return {
                      label: s,
                      disabled:
                        state.content.showMarkdown ||
                        state.content.isCaretLocked() ||
                        (state.content.styles as EditorV3Styles)[s].isNotAvailabe ||
                        state.content.caretPosition?.isCollapsed,
                      action: () => {
                        if (divRef.current) {
                          const newContent = new EditorV3Content(divRef.current, contentProps);
                          newContent.applyStyle(s);
                          setContent(newContent, "Apply style from menu");
                        }
                      },
                    };
                  }),
                  {
                    label: "Remove style",
                    disabled:
                      state.content.showMarkdown || state.content.caretPosition?.isCollapsed,
                    action: () => {
                      if (divRef.current) {
                        const newContent = new EditorV3Content(divRef.current, contentProps);
                        newContent.removeStyle();
                        setContent(newContent, "Remove style from menu");
                      }
                    },
                  },
                ],
              },
            ];

      const showMarkdownMenu = !allowMarkdown
        ? []
        : [
            {
              label: `${state.content.showMarkdown ? "Hide" : "Show"} markdown`,
              action: () => {
                setShowMarkdown(!state.content.showMarkdown);
              },
            },
          ];

      const showWindowViewMenu = !allowWindowView
        ? []
        : [
            {
              label: `${showWindowView ? "Hide" : "Show"} window view`,
              action: () => {
                if (divRef.current) {
                  const newContent = new EditorV3Content(divRef.current, contentProps);
                  newContent.caretPosition = null;
                  setContent(newContent, "Window view menu", false);
                  setShowWindowView(!showWindowView);
                }
              },
            },
          ];

      return [...styleMenuItem, ...showMarkdownMenu, ...showWindowViewMenu];
    }
    return [];
  }, [state, allowMarkdown, allowWindowView, showWindowView, contentProps, setContent]);

  // Focus and blur events are container not contenteditable level events!
  const handleFocus = useCallback(
    (e: React.FocusEvent | React.MouseEvent) => {
      if (
        state &&
        divRef.current &&
        e.target instanceof Node &&
        (divRef.current === e.target || divRef.current.contains(e.target))
      ) {
        // Get current content
        const newContent = new EditorV3Content(divRef.current, contentProps);
        // Select everything
        newContent.caretPosition = {
          startLine: 0,
          startChar: 0,
          endLine: newContent.lines.length - 1,
          endChar: newContent.lines[newContent.lines.length - 1].lineLength,
          isCollapsed: false,
        };
        setLastAction("Focus");
        setLastCaretPosition(newContent.caretPosition);
        setContent(newContent, "Select all on focus", true);
        setHasFocused(true);
      }
    },
    [state, contentProps, setContent],
  );
  const handleBlur = useCallback(() => {
    if (divRef.current && state) {
      // Get current content (this should alreact be correct);
      const newContent = new EditorV3Content(divRef.current, contentProps);
      // Select nothing
      newContent.caretPosition = null;
      setLastAction("Blur");
      setLastCaretPosition(null);
      forceReturn({ content: newContent, focus: false });
    }
  }, [state, contentProps, forceReturn]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (divRef.current && state && !state.content.showMarkdown) {
        // Handle undo/redo
        if (e.ctrlKey && e.code === "KeyZ") {
          e.stopPropagation();
          e.preventDefault();
          undo();
        } else if (e.ctrlKey && e.code === "KeyY") {
          e.stopPropagation();
          e.preventDefault();
          redo();
        } else if (
          !(
            // Ignore key down on metakeys
            ["Control", "Shift", "Alt"].includes(e.key)
          )
        ) {
          // Get current information and update content buffer
          const newContent = new EditorV3Content(divRef.current, contentProps);
          newContent.handleKeydown(e);
          setContent(newContent, `Handle key down: ${e.key}`);
        }
      }
    },
    [state, contentProps, redo, setContent, undo],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      setLastAction("Key");
      // Markdown editing should not be handled
      if (divRef.current && state && !state.content.showMarkdown) {
        // Stop handled keys
        if (["KeyY", "KeyZ"].includes(e.code) && e.ctrlKey) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        // These are handled on key down
        else if (["Backspace", "Delete"].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
        // Always set new content value
        else if (
          !(
            // Ignore key up on metakeys
            ["Control", "Shift", "Alt"].includes(e.key)
          )
        ) {
          e.preventDefault();
          e.stopPropagation();
          const newContent = new EditorV3Content(divRef.current, contentProps);
          newContent.handleKeyup(e);
          if (
            atListFunction &&
            newContent.caretPosition &&
            newContent.caretPosition.startChar > 0
          ) {
            const replacePos: EditorV3Position = {
              ...newContent.caretPosition,
              startChar: newContent.caretPosition.startChar - 1,
            };
            const lastChar = newContent
              .subLines(replacePos)
              .map((l) => l.lineText)
              .reduce((a, b) => (a += b), "");
            // Create @block if @ has been typed
            if (lastChar.trim() === "@") {
              // Do some @ magic here
              newContent.splice(replacePos, [
                new EditorV3Line([new EditorV3AtBlock({ text: "@", type: "at" })], contentProps),
              ]);
            }
          }
          setContent(newContent, `Handle key up: ${e.key}`);
        }
      }
    },
    [atListFunction, contentProps, setContent, state],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Drop down list last entry can target again resize (current.parentElement)
      if (
        divRef.current &&
        e.target instanceof Node &&
        (divRef.current.parentElement === e.target ||
          divRef.current === e.target ||
          divRef.current.contains(e.target))
      ) {
        // Ensure mouse up event stack is empty before resolving this event
        setTimeout(() => {
          if (divRef.current) {
            const newContent = new EditorV3Content(divRef.current, contentProps);
            newContent.checkStatus();
            setContent(newContent, "Handle mouse up on timeout");
          }
        }, 0);
      }
    },
    [contentProps, setContent],
  );

  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (divRef.current) {
        const newContent = new EditorV3Content(divRef.current, contentProps);
        newContent.handleCopy(e);
        setContent(newContent, "Handle copy");
      }
    },
    [contentProps, setContent],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (divRef.current) {
        const newContent = new EditorV3Content(divRef.current, contentProps);
        newContent.handlePaste(e);
        setContent(newContent, "Handle paste");
      }
    },
    [contentProps, setContent],
  );

  const styleRecalc = useMemo(() => {
    const s = { ...style };
    if (resize) {
      s.resize = "both";
      s.overflow = "auto";
    }
    if (showWindowView) {
      s.backgroundColor = "rgba(0, 0, 0, 0.3)";
    }
    return s;
  }, [resize, showWindowView, style]);

  return (
    <>
      <div
        {...rest}
        className={`aiev3${state?.focus ? " editing" : ""}${rest.className ? ` ${rest.className}` : ""}`}
        id={id}
        onFocusCapture={(e) => {
          e.preventDefault();
          rest.onFocusCapture && rest.onFocusCapture(e);
          rest.onFocus && rest.onFocus(e);
          handleFocus(e);
        }}
        onBlurCapture={(e) => {
          rest.onBlurCapture && rest.onBlurCapture(e);
          handleBlur();
          window.getSelection()?.removeAllRanges();
          rest.onBlur && rest.onBlur(e);
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          rest.onMouseUp && rest.onMouseUp(e);
        }}
        onClick={(e) => {
          e.preventDefault();
          rest.onClick && rest.onClick(e);
          if (!state?.focus && editable) handleFocus(e);
        }}
      >
        <ContextMenuHandler
          menuItems={menuItems}
          style={{ width: "100%", height: "100%" }}
          showLowMenu={spellCheck || !styleOnContextMenu}
        >
          <div
            className={`aiev3-resize${!noBorder ? " aiev3-resize-border" : ""}`}
            style={styleRecalc}
          >
            <div
              id={`${id}-editable`}
              className={`aiev3-editing ${allowNewLine ? "multiline" : "singleline"}`}
              contentEditable={
                editable &&
                !showWindowView &&
                (typeof setObject === "function" || typeof setText === "function")
              }
              suppressContentEditableWarning
              role={
                editable && (typeof setObject === "function" || typeof setText === "function")
                  ? "textbox"
                  : undefined
              }
              spellCheck={spellCheck}
              ref={divRef}
              onCopyCapture={handleCopy}
              onCutCapture={handleCopy}
              onKeyDownCapture={handleKeyDown}
              onKeyUpCapture={handleKeyUp}
              onPasteCapture={handlePaste}
            />
          </div>
        </ContextMenuHandler>
      </div>
      {allowWindowView && state && (
        <WindowView
          id={`${id}-window`}
          showWindowView={showWindowView}
          setShowWindowView={setShowWindowView}
          state={state}
          setState={(state: EditorV3State) => setContent(state.content, "Window", false)}
        />
      )}
    </>
  );
};

EditorV3.displayName = "AsupEditorV3";
