import { useState } from "react";
import { EditorV3, EditorV3Align, EditorV3Styles } from "../../src/main";

export const App = (): JSX.Element => {
  const [html, setHtml] = useState<string>("");
  const initialValue = JSON.stringify({
    textAlign: "left",
    lines: [
      { text: "12.34", style: "green" },
      { textBlocks: [{ text: "0 " }, { text: "@hello" }, { text: "  world" }] },
      { text: "56.78", style: "blue" },
    ],
    styles: {
      blue: { color: "blue", fontWeight: 700 },
    },
  });
  const testObject = {
    lines: [
      {
        textBlocks: [
          { text: "P ", type: "text" },
          { text: "Me", type: "at" },
          { text: "E", type: "text" },
        ],
      },
    ],
  };
  const [input2, setInput2] = useState<string>(
    // eslint-disable-next-line quotes
    `<div classname="aie-text" data-key="2v9v5" data-type="unstyled" data-inline-style-ranges='[{"offset":0,"length":1,"style":"Notes"},{"offset":4,"length":1,"style":"Notes"},{"offset":1,"length":3,"style":"Optional"}]'><span classname="Notes" style="color:blue;font-size:16pt">N</span><span classname="Optional" style="color:green;font-weight:100;font-family:serif;font-size:16pt">ote</span><span classname="Notes" style="color:blue;font-size:16pt">s</span>  w</div><div classname="aie-text" data-key="1u61b" data-type="unstyled" data-inline-style-ranges='[]'></div><div classname="aie-text" data-key="4l4fu" data-type="unstyled" data-inline-style-ranges='[]'>ork</div><div classname="aie-text" data-inline-style-ranges='[{"length":12,"offset":0,"style":"Notes"}]'><spanclassname="Notes" style="color:blue;font-size:16pt">Notes  w.ork</span></div><div classname="aie-text" data-key="b84n6" data-type="unstyled" data-inline-style-ranges='[{"offset":0,"length":3,"style":"Notes"},{"offset":3,"length":7,"style":"Optional"}]'><span classname="Notes" style="color:blue;font-size:16pt">Not</span><span classname="Optional" style="color:green;font-weight:100;font-family:serif;font-size:16pt">es  wor</span>k</div><div classname="aie-text" data-key="4stit" data-type="unstyled" data-inline-style-ranges='[{"offset":5,"length":2,"style":"Notes"},{"offset":10,"length":1,"style":"Notes"},{"offset":7,"length":3,"style":"Editable"}]'>treez<span classname="Notes" style="color:blue;font-size:16pt"> N</span><span classname="Editable" style="color:red;font-family:courier;font-size:16pt">ote</span><span classname="Notes" style="color:blue;font-size:16pt">s</span>  work</div><div classname="aie-text" data-key="10tu7" data-type="unstyled" data-inline-style-ranges='[{"offset":0,"length":72,"style":"Notes"}]'><span classname="Notes" style="color:royalblue">The &apos;Total&apos; column is compulsory if more than 1 treatment group is used.</span></div><div classname="aie-text" data-key="frng6" data-type="unstyled" data-inline-style-ranges='[{"offset":0,"length":92,"style":"Notes"}]'><span classname="Notes" style="color:royalblue">Timepoint could be days, weeks or visits. Permissable to only present selected (key) visits.</span></div>`,
  );
  const [input3, setInput3] = useState<string>(
    JSON.stringify({
      textAlign: "left",
      lines: [{ text: "12.34", style: "defaultStyle" }],
      styles: {
        defaultStyle: { color: "green", fontWeight: 700 },
      },
    }),
  );
  const [json, setJson] = useState<string>(initialValue);
  const [text, setText] = useState<string>("");
  const [align, setAlign] = useState<EditorV3Align>(EditorV3Align.left);
  const [editable, setEditable] = useState<boolean>(true);
  const [allowNewLine, setAllowNewLine] = useState<boolean>(true);
  const [decPct, setDecPct] = useState<number>(60);
  const styleMap: EditorV3Styles = {
    green: {
      color: "green",
      backgroundColor: "white",
      fontFamily: "Courier New",
      fontSize: "1.3rem",
      fontWeight: 1000,
    },
    blue: { color: "blue", fontWeight: 700 },
  };

  return (
    <div className="app-holder">
      <div className="app-border">
        <div className="app-inner">
          {/* <div className="row">
            <span className="label">This is the input</span>
            <span className="content">
              <EditorV3
                id={"e1"}
                input={json}
                resize
                setHtml={setHtml}
                setText={setText}
                setJson={setJson}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={styleMap}
                style={{
                  width: "240px",
                }}
                spellCheck={false}
                allowMarkdown
              />
            </span>
            <span>
              <button
                onClick={() => {
                  setJson(initialValue);
                }}
              >
                Reset
              </button>
            </span>
          </div> */}

          <div className="row">
            <span className="label">Test config</span>
            <span className="content">
              <EditorV3
                data-testid="test-editor"
                id="test-editor"
                input={JSON.stringify(testObject)}
                setJson={setJson}
              />
            </span>
          </div>

          {/* <div className="row">
            <span className="label">JSON input</span>
            <span className="content">
              <EditorV3
                id={"e2"}
                input={input2}
                setJson={(ret) => {
                  console.log("JSON INPUT", ret);
                  setInput2(ret);
                }}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={{ Notes: { color: "royalblue" }, Optional: { color: "green" } }}
                resize
                allowMarkdown
                style={{
                  width: "240px",
                  minHeight: "60px",
                  height: "60px",
                }}
              />
            </span>
          </div> */}

          {/* <div className="row">
            <span className="label">Text input (spelling)</span>
            <span className="content">
              <EditorV3
                id={"e3"}
                input={input3}
                setJson={setInput3}
                allowMarkdown
                textAlignment={EditorV3Align.left}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={styleMap}
                spellCheck={true}
                style={{
                  width: "600px",
                }}
              />
            </span>
          </div> */}

          <hr />

          <div className="row">
            <span className="label">Allow new line</span>
            <span className="content">
              <select
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
                type={"number"}
                value={decPct}
                onChange={(e) => {
                  setDecPct(e.currentTarget.value ? parseInt(e.currentTarget.value) : 0);
                }}
              />
            </span>
          </div>

          {/* <div className="row">
            <span className="label">Text</span>
            <span className="content">{text.replace(/\n/g, "\\n")}</span>
          </div> */}
          <div className="row">
            <span className="label">JSON</span>
            <span className="content">
              <pre>{json === "" ? "" : JSON.stringify(JSON.parse(json), null, 2)}</pre>
            </span>
          </div>
          {/* <div className="row">
            <span className="label">HTML</span>
            <span className="content">
              <pre>{html.replace(/></g, ">\u2009<").split("\u2009").join("\n")}</pre>
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default App;
