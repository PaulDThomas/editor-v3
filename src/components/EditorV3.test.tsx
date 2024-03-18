/* eslint-disable quotes */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align } from "../classes/interface";
import { defaultMarkdownSettings } from "../classes/markdown/MarkdownSettings";
import { getCaretPosition } from "../functions/getCaretPosition";
import { EditorV3 } from "./EditorV3";

const mockContent = new EditorV3Content("34.45\n\nx.xx", {
  allowMarkdown: true,
  allowNewLine: false,
  decimalAlignPercent: 80,
  markdownSettings: defaultMarkdownSettings,
  showMarkdown: false,
  styles: { shiny: { color: "pink", fontWeight: "700" } },
  textAlignment: EditorV3Align.decimal,
});
mockContent.applyStyle("shiny", { startLine: 2, startChar: 0, endLine: 2, endChar: 4 });

describe("Editor and functions", () => {
  test("Draw and fire cursor events", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <div data-testid="container">
          <EditorV3
            id="test-editor"
            input={mockContent.jsonString}
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            allowNewLine
          />
        </div>,
      );
    });
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(container.outerHTML).toEqual(
      '<div class="aiev3" id="test-editor">' +
        '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing multiline" contenteditable="false" spellcheck="false">' +
        '<div class="aiev3-line left"><span class="aiev3-tb">34.45</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb">\u2009</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.xx</span></div>' +
        '<div class="aiev3-contents-info" data-allow-new-line="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"' +
        "></div></div></div></div></div>",
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
    const user = userEvent.setup({ delay: null });
    const mockSetJson = jest.fn();
    const mockSetHtml = jest.fn();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={mockContent.jsonString}
          setJson={(ret) => {
            mockSetJson(ret);
          }}
          setHtml={(ret) => {
            mockSetHtml(ret);
          }}
          setText={(ret) => {
            mockSetText(ret);
          }}
          style={{ width: "200px" }}
          allowNewLine
          decimalAlignPercent={70}
          textAlignment={EditorV3Align.decimal}
        />,
      );
    });
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    let firstSpan = editor.querySelector("span") as HTMLSpanElement;

    await user.click(firstSpan);
    await user.keyboard("{Home}{End}{Backspace}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(1);
    expect(mockSetText).toHaveBeenLastCalledWith("34.4\n\nx.xx");
    expect(mockSetJson).toHaveBeenCalledTimes(1);
    expect(mockSetJson).toHaveBeenLastCalledWith(
      JSON.stringify({
        contentProps: {
          textAlignment: "decimal",
          decimalAlignPercent: 70,
          allowNewLine: true,
        },
        lines: [
          {
            textBlocks: [{ text: "34.4", type: "text" }],
          },
          {
            textBlocks: [{ text: "", type: "text" }],
          },
          {
            textBlocks: [{ text: "x.xx", style: "shiny", type: "text" }],
          },
        ],
      }),
    );
    expect(mockSetHtml).toHaveBeenCalledTimes(1);
    expect(mockSetHtml).toHaveBeenLastCalledWith(
      '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb is-active">34</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb is-active">.4</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">x</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">.xx</span></span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-new-line="true" data-decimal-align-percent="70" data-text-alignment="&quot;decimal&quot;"></div>',
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
    expect(JSON.parse(mockSetJson.mock.calls[2][0])).toEqual({
      contentProps: {
        allowNewLine: true,
        decimalAlignPercent: 70,
        textAlignment: "decimal",
      },
      lines: [
        {
          textBlocks: [{ text: "", type: "text" }],
        },
        {
          textBlocks: [{ text: "4", type: "text" }],
        },
        {
          textBlocks: [{ text: "", type: "text" }],
        },
        {
          textBlocks: [{ text: "x.xx", style: "shiny", type: "text" }],
        },
      ],
    });
    expect(mockSetHtml.mock.calls[2][0]).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb is-active">4</span></span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs">\u2009</span></div>' +
        '<div class="aiev3-line decimal" style="grid-template-columns: 70% 30%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">x</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">.xx</span></span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-new-line="true" data-decimal-align-percent="70" data-text-alignment="&quot;decimal&quot;"></div>',
    );
  });
});

describe("Menu styling - add", () => {
  test("Add style", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={mockContent.jsonString}
          setText={mockSetText}
          style={{ width: "200px" }}
          textAlignment={EditorV3Align.left}
          allowNewLine
          customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
          resize
        />,
      );
    });
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    // Go to start of text
    await user.click(editor.querySelectorAll("span")[0] as Element);
    await user.keyboard("{Home}{End}");
    expect(getCaretPosition(editor)).toEqual({
      startLine: 0,
      startChar: 5,
      isCollapsed: true,
      endLine: 0,
      endChar: 5,
    });
    // Need to click twice, first click normalised the value
    await user.keyboard("{ArrowLeft}");
    expect(getCaretPosition(editor)).toEqual({
      startLine: 0,
      startChar: 4,
      isCollapsed: true,
      endLine: 0,
      endChar: 4,
    });
    expect(editor.querySelectorAll("span")[0]).toHaveClass("is-active");
    // Check clicked span is active
    await user.keyboard("{ArrowLeft}");
    expect(editor.querySelectorAll("span")[0]).toHaveClass("is-active");
    await user.keyboard("{Control>}{Home}{/Control}{Home}{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(editor)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 5,
    });
    fireEvent.contextMenu(editor.querySelectorAll("span")[0] as HTMLSpanElement);
    const shinyItem = screen.queryByLabelText("shiny") as HTMLSpanElement;
    expect(shinyItem).toBeInTheDocument();
    fireEvent.mouseDown(shinyItem);
    await user.click(shinyItem);
    expect(editor.querySelectorAll("span")[0] as HTMLSpanElement).toHaveClass(
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
        <div data-testid="container">
          <EditorV3
            id="test-editor"
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
    const notShinyMenuItem = screen.queryByLabelText("notShiny") as HTMLSpanElement;
    expect(notShinyMenuItem).toBeInTheDocument();
    fireEvent.mouseDown(notShinyMenuItem);
    await user.click(notShinyMenuItem);
    const notShinySpan = container.querySelectorAll(
      "span.editorv3style-notShiny",
    ) as NodeListOf<HTMLSpanElement>;
    expect(notShinySpan.length).toEqual(1);
    expect(notShinySpan[0]).toHaveTextContent("x.xx");
    expect(mockSetText).toHaveBeenLastCalledWith("34.45\n\nx.xx");
  });
});

describe("Menu styling - remove", () => {
  test("Remove style", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
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
        />,
      );
    });
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    // Go to start of text
    await user.click(editor.querySelectorAll("span")[2] as HTMLSpanElement);
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(editor)).toEqual({
      startLine: 2,
      startChar: 0,
      isCollapsed: false,
      endLine: 2,
      endChar: 4,
    });
    // Click remove
    fireEvent.contextMenu(editor.querySelectorAll("span")[2]);
    expect(screen.queryByText("Remove style")).toBeInTheDocument();
    const removeStyle = screen.getByLabelText("Remove style");
    await user.click(removeStyle);
    expect(editor.querySelectorAll("span").length).toEqual(3);
    expect(editor.querySelectorAll("span")[2]).not.toHaveClass("editorv3style-shiny");
    expect(getCaretPosition(editor)).toEqual({
      startLine: 2,
      startChar: 4,
      isCollapsed: true,
      endLine: 2,
      endChar: 4,
    });
  });
});

describe("Menu styling - markdown", () => {
  test("Show markdown", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <div data-testid="container">
          <EditorV3
            id="test-editor"
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
        <div data-testid="container">
          <EditorV3
            id="test-editor"
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
    expect(JSON.parse(thingCut?.getData("data/aiev3") ?? "{}")).toEqual([
      {
        textBlocks: [{ text: "34", type: "text" }],
        contentProps: {
          allowNewLine: true,
          styles: { shiny: { color: "pink", fontWeight: "700" } },
          textAlignment: "center",
        },
      },
    ]);
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
        <div data-testid="container">
          <EditorV3
            id="test-editor-1"
            input={"Initial\ntext\n"}
            setText={mockSetText1}
            style={{ width: "200px" }}
            allowNewLine
            textAlignment={EditorV3Align.center}
          />
          <EditorV3
            id="test-editor-2"
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
        <div data-testid="container">
          <EditorV3
            id="test-editor"
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
        <div data-testid="container">
          <EditorV3
            id="test-editor"
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
      <EditorV3
        data-testid="programmernotes"
        id="programmernotes"
        input={"Item 2 programmer notes"}
        setJson={mockSet}
      />,
    );
    const editable = screen
      .queryByTestId("programmernotes")
      ?.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 23,
    });
    await user.keyboard("{Delete}");
    expect(getCaretPosition(editable)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: true,
      endLine: 0,
      endChar: 0,
    });
    await user.keyboard("New programmer notes");
    // Select all
    await user.keyboard("{Control>}{a}{/Control}");
    expect(getCaretPosition(editable)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 20,
    });
    fireEvent.blur(editable);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("programmer")).toBeInTheDocument();
    expect(screen.getByText("notes")).toBeInTheDocument();
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockSet.mock.calls[0])).toEqual({
      lines: [
        {
          textBlocks: [{ text: "New programmer notes", type: "text" }],
        },
      ],
    });
  });
});

describe("Undo/redo", () => {
  const TestContainer = () => {
    const [input, setInput] = useState("");
    return (
      <div>
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setJson={(ret) => {
            setInput(ret);
          }}
          allowMarkdown
        />
      </div>
    );
  };
  test("Undo/redo", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TestContainer />);
    });
    const editable = screen
      .queryByTestId("test-editor")
      ?.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    expect(getCaretPosition(editable)).toEqual(null);
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: true,
      endLine: 0,
      endChar: 0,
    });
    await user.keyboard("added");
    expect(screen.queryByText("added")).toBeInTheDocument();
    await user.keyboard("{Control>}z{/Control}");
    expect(screen.queryByText("adde")).toBeInTheDocument();
    await user.keyboard("{Control>}z{/Control}");
    expect(screen.queryByText("add")).toBeInTheDocument();
    await user.keyboard("{Control>}y{/Control}");
    expect(screen.queryByText("adde")).toBeInTheDocument();
    await user.keyboard("{Control>}y{/Control}");
    expect(screen.queryByText("added")).toBeInTheDocument();
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
      <div data-testid="container">
        <button
          data-testid="change-input"
          onClick={() => setInput("New <<shiny::input>>")}
        />
        <button
          data-testid="change-text-alignment"
          onClick={() => setTextAlignment(EditorV3Align.center)}
        />
        <button
          data-testid="change-decimal-align-percent"
          onClick={() => {
            setDecimalAlignPercent(80);
            setTextAlignment(EditorV3Align.decimal);
          }}
        />
        <button
          data-testid="change-styles"
          onClick={() => setStyles({ shiny: { color: "blue" } })}
        />
        <button
          data-testid="change-markdown-settings"
          onClick={() => setMarkdownSettings({ ...defaultMarkdownSettings, styleStartTag: "¬¬" })}
        />
        <EditorV3
          data-testid="editor"
          id="test-editor"
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">New&nbsp;</span><span class="aiev3-tb">&lt;&lt;shiny::input&gt;&gt;</span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div></div>' +
        "</div></div>",
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line center">' +
        '<span class="aiev3-tb">Before</span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}" data-text-alignment="&quot;center&quot;"></div></div>' +
        "</div></div>",
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line decimal" style="grid-template-columns: 80% 20%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">Before</span></span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-decimal-align-percent="80" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}" data-text-alignment="&quot;decimal&quot;"></div></div>' +
        "</div></div>",
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">Before</span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;blue&quot;}}"></div>' +
        "</div></div></div>",
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line">Before</div>' +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-show-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div></div>",
    );
    // Update text
    await user.click(screen.getByTestId("change-input"));
    expect(editor.innerHTML).toEqual(
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line">New &lt;&lt;shiny::input&gt;&gt;</div>' +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-show-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div></div>",
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
      '<div class="context-menu-handler" style="width: 100%; height: 100%;"><div class="aiev3-resize">' +
        '<div id="test-editor-editable" class="aiev3-editing singleline" contenteditable="true" role="textbox" spellcheck="false">' +
        '<div class="aiev3-markdown-line">New ¬¬shiny::input&gt;&gt;</div>' +
        '<div class="aiev3-contents-info" data-allow-markdown="true" data-markdown-settings="{&quot;styleStartTag&quot;:&quot;¬¬&quot;,&quot;styleNameEndTag&quot;:&quot;::&quot;,&quot;styleEndTag&quot;:&quot;>>&quot;,&quot;defaultStyle&quot;:&quot;defaultStyle&quot;,&quot;dropDownStartTag&quot;:&quot;[[&quot;,&quot;dropDownNameEndTag&quot;:&quot;::&quot;,&quot;dropDownEndTag&quot;:&quot;]]&quot;,&quot;dropDownValueSeparator&quot;:&quot;||&quot;,&quot;dropDownSelectedValueTag&quot;:&quot;**&quot;,&quot;calcStartTag&quot;:&quot;[![&quot;,&quot;calcNameEndTag&quot;:&quot;::&quot;,&quot;calcEndTag&quot;:&quot;]!]&quot;,&quot;calcConditionSeparator&quot;:&quot;||&quot;,&quot;calcAndSeparator&quot;:&quot;&amp;&amp;&quot;,&quot;atStartTag&quot;:&quot;@[&quot;,&quot;atEndTag&quot;:&quot;@]&quot;}" data-show-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div></div>",
    );
  });
});

describe("Add at block and escape out", () => {
  test("Type at block", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetText = jest.fn();
    const mockSetJson = jest.fn();
    const TestEditor = () => {
      const [input, setInput] = useState("Initial text");
      return (
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setJson={(ret) => {
            setInput(ret);
            mockSetJson(ret);
          }}
          setText={mockSetText}
          atListFunction={async (typedString: string) => {
            const atList = ["@Hello", "@Lovely", "@People"];
            return atList.filter((at) => at.toLowerCase().includes(typedString.toLowerCase()));
          }}
        />
      );
    };
    await act(async () => {
      render(<TestEditor />);
    });
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    await user.keyboard("@Hello{Escape} world");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenLastCalledWith("@Hello world");
    expect(mockSetJson).toHaveBeenLastCalledWith(
      JSON.stringify({
        lines: [
          {
            textBlocks: [
              { text: "@Hello", type: "at", isLocked: true },
              { text: " world", type: "text" },
            ],
          },
        ],
      }),
    );
  });
});
