import { useState } from "react";
import { EditorV3, EditorV3Align, EditorV3Styles, IEditorV3, StylesEditor } from "../../src/main";
import { loadAvailableItems } from "./loadAvailableItems";
import { BaseEditorV3 } from "../../src/components/BaseEditorv3";

export const App = (): JSX.Element => {
  // First input content
  const initialValue: IEditorV3 = {
    lines: [
      {
        textBlocks: [
          { text: "12.34 love", style: "green", label: "First" },
          { text: "your work", style: "green", label: "Second" },
        ],
      },
      {
        textBlocks: [
          { text: "0 " },
          { text: "@hello", type: "at", atData: { email: "hello@world" } },
          { text: "  world" },
        ],
      },
      { textBlocks: [{ text: "56.78", style: "blue" }] },
      {
        textBlocks: [
          {
            text: "Optional long line-that includes hyphen-s--s, it does needs to be really really long though",
            style: "green",
          },
        ],
      },
      {
        textBlocks: [{ text: "Another line to test" }],
      },
      {
        textBlocks: [{ text: "Notes line", style: "blue" }],
      },
    ],
    contentProps: {
      textAlignment: EditorV3Align.left,
      styles: {
        blue: { color: "blue", fontWeight: 700, fontSize: "22pt" },
      },
    },
  };

  const [editorV3_1, setEditorV3_1] = useState<IEditorV3>(initialValue);
  const [text, setText] = useState<string>("");

  // Secont input content
  const testObject: IEditorV3 = {
    lines: [
      // {
      //   textBlocks: [
      //     { text: "P ", type: "text" },
      //     { text: "Me", type: "at" },
      //     { text: "E", type: "text" },
      //   ],
      // },
      // {
      //   textBlocks: [
      //     {
      //       text: "Select",
      //       type: "select",
      //       availableOptions: [
      //         { text: "one", data: { text: "one", style: "Notes" } },
      //         { text: "two", data: { text: "two" } },
      //         { text: "three", data: { text: "three", style: "Optional" } },
      //       ],
      //     },
      //   ],
      // },
    ],
  };

  // Third input content
  const [input3, setInput3] = useState<IEditorV3>({
    contentProps: {
      textAlignment: EditorV3Align.left,
      styles: {
        defaultStyle: { color: "green", fontWeight: 700 },
      },
    },
    lines: [
      {
        textBlocks: [
          { text: "two words", style: "defaultStyle" },
          { text: "1st locked block", style: "green" },
          { text: " [[2nd locked block]] ", style: "green" },
          {
            text: "[[select-block]]",
            type: "select",
            availableOptions: [
              { text: "green", data: { text: "green", style: "green" } },
              { text: "red", data: { text: "red", style: "red" } },
              { text: "black", data: { text: "black" } },
            ],
          },
          { text: "lots of locks", style: "red" },
        ],
      },
    ],
  });

  const [align, setAlign] = useState<EditorV3Align>(EditorV3Align.left);
  const [editable, setEditable] = useState<boolean>(true);
  const [allowNewLine, setAllowNewLine] = useState<boolean>(true);
  const [maxAtListLength, setMaxAtListLength] = useState<number>(10);
  const [decPct, setDecPct] = useState<number>(60);
  const [styleMap, setStyleMap] = useState<EditorV3Styles>({
    green: {
      color: "green",
      // fontFamily: "'Courier New', monospace",
      // fontSize: "18pt",
      // fontWeight: 1000,
      isLocked: true,
      isNotAvailable: true,
    },
    blue: { color: "blue", fontWeight: 700, fontSize: "22pt" },
    red: { color: "red", isNotAvailable: true },
  });

  return (
    <div className="app-holder">
      <div className="app-border">
        <div className="app-inner">
          <div className="row">
            <span className="label">This is the input</span>
            <span className="content debug">
              <EditorV3
                id={"e1"}
                input={editorV3_1}
                setText={setText}
                setObject={(ret) => {
                  setEditorV3_1(ret);
                }}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={styleMap}
                style={{
                  width: "500px",
                  height: "100px",
                }}
                resize
                allowWindowView
                atListFunction={loadAvailableItems}
                debounceMilliseconds={1000}
                maxAtListLength={maxAtListLength}
              />
            </span>
            <span>
              <button
                onClick={() => {
                  setEditorV3_1(initialValue);
                }}
              >
                Reset
              </button>
            </span>
          </div>
          <div className="row">
            <span className="label">Styles editor</span>
            <span className="content">
              <StylesEditor
                styles={styleMap}
                setStyles={setStyleMap}
              />
            </span>
          </div>

          <div className="row">
            <BaseEditorV3
              label={"JSON input"}
              id={"e2"}
              input={testObject}
              setObject={() => {
                // console.log(ret);
              }}
              allowNewLine={allowNewLine}
              editable={editable}
              customStyleMap={{
                Notes: { color: "royalblue" },
                Optional: { color: "green" },
              }}
              resize
              allowMarkdown
              allowWindowView
              errorText={"Some\nerror\nmessage"}
              style={{
                width: "400px",
                minHeight: "100px",
                height: "60px",
              }}
            />
          </div>

          <div className="row">
            <span className="label">Text input (spelling)</span>
            <span className="content">
              <BaseEditorV3
                id={"e3"}
                label="Text input (spelling)"
                input={input3}
                setObject={setInput3}
                allowMarkdown
                textAlignment={EditorV3Align.left}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={{
                  ...styleMap,
                  red: { color: "red", isLocked: true },
                }}
                resize="vertical"
                spellCheck
                style={{
                  width: "600px",
                }}
              />
            </span>
          </div>

          <hr />

          <div className="row">
            <span className="label">Allow new line</span>
            <span className="content">
              <select
                id="allowNewLine"
                value={allowNewLine ? "true" : "false"}
                onChange={(e) => {
                  setAllowNewLine(e.currentTarget.value === "true");
                }}
              >
                <option value={"true"}>true</option>
                <option value={"false"}>false</option>
              </select>
            </span>
          </div>

          <div className="row">
            <span className="label">Editable</span>
            <span className="content">
              <select
                id="editable"
                value={editable ? "true" : "false"}
                onChange={(e) => {
                  setEditable(e.currentTarget.value === "true");
                }}
              >
                <option value={"true"}>true</option>
                <option value={"false"}>false</option>
              </select>
            </span>
          </div>

          <div className="row">
            <span className="label">Alignment</span>
            <span className="content">
              <select
                id="align"
                value={align}
                onChange={(e) => {
                  const v: EditorV3Align = e.currentTarget.value as EditorV3Align;
                  setAlign(v);
                }}
              >
                {Object.keys(EditorV3Align).map((k) => (
                  <option
                    key={k}
                    value={k as EditorV3Align}
                  >
                    {k}
                  </option>
                ))}
              </select>
            </span>
          </div>

          <div className="row">
            <span className="label">Decimal percent</span>
            <span className="content">
              <input
                id="decPct"
                type={"number"}
                value={decPct}
                onChange={(e) => {
                  setDecPct(e.currentTarget.value ? parseInt(e.currentTarget.value) : 0);
                }}
              />
            </span>
          </div>

          <div className="row">
            <span className="label">Max at list length</span>
            <span className="content">
              <input
                id="maxAtListLength"
                type={"number"}
                value={maxAtListLength}
                onChange={(e) => {
                  setMaxAtListLength(e.currentTarget.value ? parseInt(e.currentTarget.value) : 0);
                }}
              />
            </span>
          </div>

          <div className="row">
            <span className="label">Text</span>
            <span className="content">{text.replace(/\n/g, "\\n")}</span>
          </div>
          <div className="row">
            <span className="label">JSON</span>
            <span className="content">
              <pre>{JSON.stringify(editorV3_1, null, 2)}</pre>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
