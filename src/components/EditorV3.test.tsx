/* eslint-disable quotes */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align } from "../classes/interface";
import { EditorV3 } from "./EditorV3";
import { getCaretPosition } from "../functions/getCaretPosition";
import { useState } from "react";
import { defaultMarkdownSettings } from "../classes/markdown/MarkdownSettings";

const mockContent = new EditorV3Content("34.45\n\nx.xx", {
  styles: { shiny: { color: "pink", fontWeight: "700" } },
  textAlignment: EditorV3Align.decimal,
  decimalAlignPercent: 80,
});
mockContent.applyStyle("shiny", { startLine: 2, startChar: 0, endLine: 2, endChar: 4 });

describe("Editor and functions", () => {
  test("Draw and fire cursor events", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            allowNewLine
          />
        </div>,
      );
    });
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(container.outerHTML).toEqual(
      '<div class="aiev3" id="test-editor">' +
        '<div class="context-menu-handler" style="width: 100%; height: 100%;">' +
        '<div id="test-editor-editable" class="aiev3-editing multiline" contenteditable="false" spellcheck="false">' +
        '<div class="aiev3-line left"><span class="aiev3-tb">34.45</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb">\u2009</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.xx</span></div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"' +
        "></div></div></div> </div>",
    );
    const firstSpan = container.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    fireEvent.keyDown(firstSpan, { key: "Home" });
    for (let i = 0; i < 15; i++) {
      fireEvent.keyDown(firstSpan, { key: "ArrowRight" });
    }
    for (let i = 0; i < 15; i++) {
      fireEvent.keyDown(firstSpan, { key: "ArrowLeft" });
    }
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(firstSpan, { key: "ArrowDown" });
    }
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(firstSpan, { key: "ArrowUp" });
    }
  });

  test("Backspace and delete", async () => {
    const user = userEvent.setup();
    const mockSetJson = jest.fn();
    const mockSetHtml = jest.fn();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setJson={mockSetJson}
            setHtml={mockSetHtml}
            setText={mockSetText}
            style={{ width: "200px" }}
            allowNewLine
            textAlignment={EditorV3Align.decimal}
            decimalAlignPercent={70}
            allowMarkdown
          />
        </div>,
      );
    });
    const editor = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    let firstSpan = editor.querySelector("span") as HTMLSpanElement;

    await user.click(firstSpan);
    await user.keyboard("{Control>}{ArrowUp}{/Control}{End}{Backspace}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(1);
    expect(mockSetText).toHaveBeenNthCalledWith(1, "34.4\n\nx.xx");
    expect(mockSetJson).toHaveBeenCalledWith(
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: "34.4" }], textAlignment: "decimal", decimalAlignPercent: 70 },
          { textBlocks: [{ text: "" }], textAlignment: "decimal", decimalAlignPercent: 70 },
          {
            textBlocks: [{ text: "x.xx", style: "shiny" }],
            textAlignment: "decimal",
            decimalAlignPercent: 70,
          },
        ],
        textAlignment: "decimal",
        decimalAlignPercent: 70,
        styles: { shiny: { color: "pink", fontWeight: "700" } },
      }),
    );

    // Reacquire firstSpan
    firstSpan = editor.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    await user.keyboard("{Home}{Delete}{Delete}{Delete}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(2);
    expect(mockSetText).toHaveBeenNthCalledWith(2, "4\n\nx.xx");

    // Reacquire firstSpan
    firstSpan = editor.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    await user.keyboard("{Control>}{ArrowUp}{/Control}{Home}{Enter}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(3);
    expect(mockSetText).toHaveBeenNthCalledWith(3, "\n4\n\nx.xx");
    expect(mockSetJson).toHaveBeenLastCalledWith(
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: "" }], textAlignment: "decimal", decimalAlignPercent: 70 },
          { textBlocks: [{ text: "4" }], textAlignment: "decimal", decimalAlignPercent: 70 },
          { textBlocks: [{ text: "" }], textAlignment: "decimal", decimalAlignPercent: 70 },
          {
            textBlocks: [{ text: "x.xx", style: "shiny" }],
            textAlignment: "decimal",
            decimalAlignPercent: 70,
          },
        ],
        textAlignment: "decimal",
        decimalAlignPercent: 70,
        styles: { shiny: { color: "pink", fontWeight: "700" } },
      }),
    );
    expect(mockSetHtml).toHaveBeenLastCalledWith(
      '<div class="aiev3-line decimal"><span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;">\u2009</span><span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span></div><div class="aiev3-line decimal"><span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;"><span class="aiev3-tb">4</span></span><span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span></div><div class="aiev3-line decimal"><span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;">\u2009</span><span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span></div><div class="aiev3-line decimal"><span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x</span></span><span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">.xx</span></span></div><div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>',
    );
  });
});

describe("Cursor tests", () => {
  test("Movements", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.decimal}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelector("span") as HTMLSpanElement);
    await user.keyboard("{Control>}{Home}{/Control}{Home}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: true,
      endLine: 0,
      endChar: 0,
    });
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 5,
    });
    await user.keyboard("{Shift>}{End}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 2,
      endChar: 4,
    });
    await user.keyboard("{Home}{ArrowRight}{ArrowRight}{Shift>}{ArrowRight}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 2,
      isCollapsed: false,
      endLine: 0,
      endChar: 3,
    });
    await user.keyboard("{Control>}{ArrowDown}{/Control}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 3,
      isCollapsed: true,
      endLine: 2,
      endChar: 3,
    });
    await user.keyboard("{Shift>}{ArrowUp}{ArrowLeft}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 5,
      isCollapsed: false,
      endLine: 2,
      endChar: 3,
    });
    await user.keyboard("{ArrowLeft}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 4,
      isCollapsed: true,
      endLine: 0,
      endChar: 4,
    });
    await user.keyboard("{ArrowUp}{ArrowDown}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 1,
      startChar: 0,
      isCollapsed: true,
      endLine: 1,
      endChar: 0,
    });
    await user.keyboard("{ArrowRight}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 0,
      isCollapsed: true,
      endLine: 2,
      endChar: 0,
    });
    await user.keyboard(
      "{ArrowDown}{Control>}{ArrowLeft}{ArrowUp}{ArrowRight}{ArrowRight}{/Control}.",
    );
  });
});

describe("Menu styling - add", () => {
  test("Add style", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.left}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelectorAll("span")[0] as HTMLSpanElement);
    await user.keyboard("{Control>}{Home}{/Control}{Home}{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 5,
    });
    fireEvent.contextMenu(container.querySelectorAll("span")[0] as HTMLSpanElement);
    const shinyItem = screen.queryByLabelText("shiny") as HTMLSpanElement;
    expect(shinyItem).toBeInTheDocument();
    fireEvent.mouseDown(shinyItem);
    await user.click(shinyItem);
    expect(container.querySelectorAll("span")[0] as HTMLSpanElement).toHaveClass(
      "editorv3style-shiny",
    );
  });
});

describe("Menu styling - change", () => {
  test("Change style", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.left}
            allowNewLine
            customStyleMap={{
              shiny: { color: "pink", fontWeight: "700" },
              notShiny: { color: "blue" },
            }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelectorAll("span")[0] as HTMLSpanElement);
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 0,
      isCollapsed: false,
      endLine: 2,
      endChar: 4,
    });
    fireEvent.contextMenu(container.querySelectorAll("span")[2] as HTMLSpanElement);
    const shinyItem = screen.queryByLabelText("notShiny") as HTMLSpanElement;
    expect(shinyItem).toBeInTheDocument();
    fireEvent.mouseDown(shinyItem);
    await user.click(shinyItem);
    expect(container.querySelectorAll("span")[2] as HTMLSpanElement).toHaveClass(
      "editorv3style-notShiny",
    );
  });
});

describe("Menu styling - remove", () => {
  test("Remove style", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.left}
            allowNewLine
            customStyleMap={{
              shiny: { color: "pink", fontWeight: "700" },
              notShiny: { color: "blue" },
            }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelectorAll("span")[2] as HTMLSpanElement);
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 0,
      isCollapsed: false,
      endLine: 2,
      endChar: 4,
    });
    // Click remove
    fireEvent.contextMenu(container.querySelectorAll("span")[2]);
    expect(screen.queryByText("Remove style")).toBeInTheDocument();
    const removeStyle = screen.getByLabelText("Remove style");
    await user.click(removeStyle);
    expect(container.querySelectorAll("span")[2]).not.toHaveClass("editorv3style-shiny");
  });
});

describe("Menu styling - markdown", () => {
  test("Show markdown", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setJson={jest.fn()}
            style={{ width: "200px" }}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            allowMarkdown
          />
        </div>,
      );
    });
    // Get component
    const container = screen.getByTestId("container").children[0] as HTMLDivElement;
    expect(container).toBeInTheDocument();
    const thirdSpan = container.querySelectorAll("span")[2] as HTMLSpanElement;
    // Click show markdown
    fireEvent.contextMenu(thirdSpan);
    const showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    const markdownText = screen.queryByText(/shiny::x.xx/) as HTMLDivElement;
    expect(markdownText).toBeInTheDocument();
    fireEvent.contextMenu(markdownText);
    expect(screen.queryByText("Hide markdown")).toBeInTheDocument();
  });
});

describe("Cut and paste", () => {
  test("Cut and paste", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.center}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelector("span") as HTMLSpanElement);
    await user.keyboard("{Control>}{Home}{/Control}{Home}{Shift>}{ArrowRight}{ArrowRight}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 2,
    });
    const thingCut = await user.cut();
    expect(thingCut?.getData("text/plain")).toEqual("34");
    expect(thingCut?.getData("text/html")).toEqual(
      '<div class="aiev3-line center"><span class="aiev3-tb">34</span></div>',
    );
    expect(thingCut?.getData("data/aiev3")).toEqual(
      '[{"textBlocks":[{"text":"34"}],"textAlignment":"center","decimalAlignPercent":60}]',
    );
    fireEvent.blur(container);
    expect(mockSetText).toHaveBeenLastCalledWith(".45\n\nx.xx");
    // Paste at the end
    await user.click(container.querySelector("span") as HTMLSpanElement);
    await user.keyboard("{Control>}{End}{End}{/Control}");
    await user.paste("34");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 6,
      isCollapsed: true,
      endLine: 2,
      endChar: 6,
    });

    fireEvent.blur(container);
    expect(mockSetText).toHaveBeenLastCalledWith(".45\n\nx.xx34");
  });

  test("Paste into single line", async () => {
    const user = userEvent.setup();
    const mockSetText1 = jest.fn();
    const mockSetText2 = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor-1'
            input={"Initial\ntext\n"}
            setText={mockSetText1}
            style={{ width: "200px" }}
            allowNewLine
            textAlignment={EditorV3Align.center}
          />
          <EditorV3
            id='test-editor-2'
            input={""}
            setText={mockSetText2}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.center}
          />
        </div>,
      );
    });
    // Get components
    const editor1 = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    const editor2 = (await screen.findByTestId("container")).children[1] as HTMLDivElement;
    // Go to start of text
    await user.click(editor1.querySelector("span") as HTMLSpanElement);
    await user.keyboard(
      "{Control>}{ArrowUp}{/Control}{Shift>}{ArrowDown}{ArrowDown}{ArrowDown}{/Shift}",
    );
    const thingCut = await user.cut();
    fireEvent.blur(editor1);
    expect(mockSetText1).toHaveBeenLastCalledWith("");
    await user.click(editor2.querySelector("span") as HTMLSpanElement);
    await user.paste(thingCut);
    fireEvent.blur(editor2);
    expect(mockSetText2).toHaveBeenCalledWith("Initialtext");
  });
});

describe("Edge events", () => {
  test("Initial focus", async () => {
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
          />
        </div>,
      );
    });
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    const editorHolder = container.querySelector("#test-editor-editable") as HTMLDivElement;
    expect(editorHolder).toBeInTheDocument();
    fireEvent.focus(editorHolder);
  });
  test("Paste error - cannot work out how to accurately throw", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setText={mockSetText}
          />
        </div>,
      );
    });
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    const editorHolder = container.querySelector("#test-editor-editable") as HTMLDivElement;
    expect(editorHolder).toBeInTheDocument();
    await user.click(editorHolder.querySelector("span") as HTMLSpanElement);
    // await expect(
    //   user.paste({
    //     getData: (type: string) => {
    //       if (type === "data/aiev3") {
    //         return "NotJSONString";
    //       }
    //     },
    //   } as DataTransfer),
    // ).rejects.toThrow();
  });
});

describe("Select all", () => {
  test("Programmer notes", async () => {
    const user = userEvent.setup();
    const mockSet = jest.fn();
    render(
      <div data-testid='container'>
        <EditorV3
          id='programmernotes'
          input={"Item 2 programmer notes"}
          textAlignment={EditorV3Align.left}
          setJson={mockSet}
        />
      </div>,
    );
    const container = screen.getByTestId("container") as HTMLDivElement;
    const box = container.querySelector("#programmernotes-editable") as HTMLDivElement;
    expect(box).toBeInTheDocument();
    await user.click(box);
    await user.keyboard("{Control>}a{/Control}{Delete}");
    await user.keyboard("New programmer notes");
    fireEvent.blur(box);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("programmer")).toBeInTheDocument();
    expect(screen.getByText("notes")).toBeInTheDocument();
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(
      JSON.stringify({
        lines: [
          {
            textBlocks: [{ text: "New programmer notes" }],
            textAlignment: "left",
            decimalAlignPercent: 60,
          },
        ],
        textAlignment: "left",
        decimalAlignPercent: 60,
        styles: {},
      }),
    );
  });
});

describe("Undo/redo", () => {
  const TestContainer = () => {
    const [input, setInput] = useState("");
    return (
      <div data-testid='container'>
        <EditorV3
          id='test-editor'
          input={input}
          setJson={setInput}
          allowMarkdown
          // forceUpdate
        />
      </div>
    );
  };
  test("Undo/redo", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TestContainer />);
    });
    const inputSpan = screen.queryByTestId("container")?.querySelector("span") as HTMLSpanElement;
    expect(inputSpan).toBeInTheDocument();
    await user.click(inputSpan);
    await user.keyboard("added");
    expect(screen.queryByText("added")).toBeInTheDocument();
    await user.keyboard("{Control>}z{/Control}");
    expect(screen.queryByText("adde")).toBeInTheDocument();
    await user.keyboard("{Control>}z{/Control}");
    expect(screen.queryByText("add")).toBeInTheDocument();
    await user.keyboard("{Control>}y{/Control}");
    expect(screen.queryByText("adde")).toBeInTheDocument();
  });
});

describe("Updates from above", () => {
  const TestContainer = () => {
    const [input, setInput] = useState("Before");
    const [textAlignment, setTextAlignment] = useState<EditorV3Align>(EditorV3Align.left);
    const [decimalAlignPercent, setDecimalAlignPercent] = useState<number>(60);
    const [styles, setStyles] = useState<{ [key: string]: React.CSSProperties }>({
      shiny: { color: "pink", fontWeight: "700" },
    });
    const [markdownSettings, setMarkdownSettings] = useState(defaultMarkdownSettings);

    return (
      <div data-testid='container'>
        <button
          data-testid='change-input'
          onClick={() => setInput("New <<shiny::input>>")}
        />
        <button
          data-testid='change-text-alignment'
          onClick={() => setTextAlignment(EditorV3Align.center)}
        />
        <button
          data-testid='change-decimal-align-percent'
          onClick={() => {
            setDecimalAlignPercent(80);
            setTextAlignment(EditorV3Align.decimal);
          }}
        />
        <button
          data-testid='change-styles'
          onClick={() => setStyles({ shiny: { color: "blue" } })}
        />
        <button
          data-testid='change-markdown-settings'
          onClick={() => setMarkdownSettings({ ...defaultMarkdownSettings, styleStartTag: "¬¬" })}
        />
        <EditorV3
          data-testid='editor'
          id='test-editor'
          input={input}
          setJson={setInput}
          allowMarkdown
          textAlignment={textAlignment}
          decimalAlignPercent={decimalAlignPercent}
          customStyleMap={styles}
          markdownSettings={markdownSettings}
        />
      </div>
    );
  };

  test("Change input", async () => {
    const user = userEvent.setup();
    await act(async () => render(<TestContainer />));
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-input");
    await user.click(changeInput);
    expect(screen.queryByText("New")).toBeInTheDocument();
    expect(screen.queryByText("<<shiny::input>>")).toBeInTheDocument();
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">New&nbsp;</span><span class="aiev3-tb">&lt;&lt;shiny::input&gt;&gt;</span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div></div>' +
        "</div> ",
    );
  });

  test("Change alignment", async () => {
    const user = userEvent.setup();
    await act(async () => render(<TestContainer />));
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-text-alignment");
    await user.click(changeInput);
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line center">' +
        '<span class="aiev3-tb">Before</span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div></div>' +
        "</div> ",
    );
  });

  test("Change decimal align percent", async () => {
    const user = userEvent.setup();
    await act(async () => render(<TestContainer />));
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-decimal-align-percent");
    await user.click(changeInput);
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="aiev3-tb">Before</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="aiev3-tb"> </span></span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div></div>' +
        "</div> ",
    );
  });

  test("Change styles", async () => {
    const user = userEvent.setup();
    await act(async () => render(<TestContainer />));
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-styles");
    await user.click(changeInput);
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">Before</span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;blue&quot;}}"></div>' +
        "</div></div> ",
    );
  });

  test("Change markdown settings", async () => {
    const user = userEvent.setup();
    await act(async () => render(<TestContainer />));
    const editor = screen.getByTestId("editor");
    // Click show markdown
    fireEvent.contextMenu(editor.querySelectorAll("span")[0] as HTMLSpanElement);
    let showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line" data-text-alignment="left" data-decimal-align-percent="60">Before</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div> ",
    );
    // Update text
    await user.click(screen.getByTestId("change-input"));
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line" data-text-alignment="left" data-decimal-align-percent="60">New &lt;&lt;shiny::input&gt;&gt;</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div> ",
    );
    // Hide markdown
    fireEvent.contextMenu(editor.querySelectorAll(".aiev3-markdown-line")[0] as HTMLDivElement);
    const hideMarkdown = screen.getByLabelText("Hide markdown");
    await user.click(hideMarkdown);

    // Change markdown and show again
    await user.click(screen.getByTestId("change-markdown-settings"));
    fireEvent.contextMenu(editor.querySelectorAll("span")[0] as HTMLSpanElement);
    showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line" data-text-alignment="left" data-decimal-align-percent="60">New ¬¬shiny::input&gt;&gt;</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div> ",
    );
  }, 500000);
});
