import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align } from "../classes/interface";
import { EditorV3 } from "./EditorV3";
import * as applyStyleModule from "../functions/applyStyle";
import { getCaretPosition } from "../functions/getCaretPosition";

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
          />
        </div>,
      );
    });
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(container.outerHTML).toEqual(
      '<div class="aiev3" id="test-editor">' +
        '<div class="context-menu-handler" style="width: 100%; height: 100%;">' +
        '<div id="test-editor-editable" class="aiev3-editing" contenteditable="false" spellcheck="false">' +
        '<div class="aiev3-line left" style="height: 0px;">' +
        '<span class="aiev3-tb">34.45</span>' +
        "</div>" +
        '<div class="aiev3-line left" style="height: 0px;">' +
        '<span class="aiev3-tb">\u2009</span>' +
        "</div>" +
        '<div class="aiev3-line left" style="height: 0px;">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.xx</span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        "</div></div> </div>",
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
            forceUpdate
            allowMarkdown
          />
        </div>,
      );
    });
    expect(mockSetText).toHaveBeenCalledWith("34.45\n\nx.xx");
    expect(mockSetJson).toHaveBeenCalledWith(
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: "34.45" }], textAlignment: "decimal", decimalAlignPercent: 70 },
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
    const editor = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    let firstSpan = editor.querySelector("span") as HTMLSpanElement;

    await user.click(firstSpan);
    await user.keyboard("{Control>}{ArrowUp}{/Control}{End}{Backspace}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(2);
    expect(mockSetText).toHaveBeenNthCalledWith(2, "34.4\n\nx.xx");

    // Reacquire firstSpan
    firstSpan = editor.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    await user.keyboard("{Home}{Delete}{Delete}{Delete}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(3);
    expect(mockSetText).toHaveBeenNthCalledWith(3, "4\n\nx.xx");

    // Reacquire firstSpan
    firstSpan = editor.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    await user.keyboard("{Control>}{ArrowUp}{/Control}{Home}{Enter}");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(4);
    expect(mockSetText).toHaveBeenNthCalledWith(4, "\n4\n\nx.xx");
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
      '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;">\u2009</span>' +
        '<span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;"><span class="aiev3-tb">4</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;">\u2009</span>' +
        '<span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 30%; min-width: 70%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 70%; min-width: 30%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">.xx</span></span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>',
    );
  });
});

describe("Stop force update", () => {
  test("Force update off", async () => {
    const mockSetJson = jest.fn();
    const mockApplyStyle = jest.fn();
    jest.spyOn(applyStyleModule, "applyStyle").mockImplementation(mockApplyStyle);
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={"Hello"}
            forceUpdate={false}
            setJson={mockSetJson}
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(mockSetJson).not.toHaveBeenCalled();
    fireEvent.focus(container);
    expect(mockSetJson).toHaveBeenCalled();
  });
});

describe("Menu styling", () => {
  test("Add and remove style", async () => {
    const user = userEvent.setup();
    const mockSetJson = jest.fn();
    const mockSetText = jest.fn();
    const mockApplyStyle = jest.fn();
    jest.spyOn(applyStyleModule, "applyStyle").mockImplementation(mockApplyStyle);
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={mockContent.jsonString}
            setJson={mockSetJson}
            setText={mockSetText}
            style={{ width: "200px" }}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            forceUpdate
            allowMarkdown
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    // Highlight first line
    let firstSpan = container.querySelector("span") as HTMLSpanElement;
    await user.click(firstSpan);
    // Click shiny
    fireEvent.contextMenu(firstSpan);
    const shinyItem = screen.queryByLabelText("shiny") as HTMLSpanElement;
    expect(shinyItem).toBeInTheDocument();
    fireEvent.mouseDown(shinyItem);
    await user.click(shinyItem);
    let calledParams = mockApplyStyle.mock.calls[0];
    expect(calledParams[0]).toEqual("shiny");
    // Click remove
    firstSpan = container.querySelector("span") as HTMLSpanElement;
    fireEvent.contextMenu(firstSpan);
    expect(screen.queryByText("Remove style")).toBeInTheDocument();
    const removeItem = screen.getByLabelText("Remove style");
    await user.click(removeItem);
    calledParams = mockApplyStyle.mock.calls[1];
    expect(calledParams[0]).toEqual(null);
    // Click show markdown
    fireEvent.contextMenu(firstSpan);
    const showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    const markdownText = screen.queryByText(/shiny::x.xx/) as HTMLDivElement;
    expect(markdownText).toBeInTheDocument();
    fireEvent.contextMenu(markdownText);
    expect(screen.queryByText("Hide markdown")).toBeInTheDocument();
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
            forceUpdate
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
            forceUpdate
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
            forceUpdate
          />
          <EditorV3
            id='test-editor-2'
            input={""}
            setText={mockSetText2}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.center}
            forceUpdate
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
  // test("Paste error", async () => {
  //   const user = userEvent.setup();
  //   const mockSetText = jest.fn();
  //   await act(async () => {
  //     render(
  //       <div data-testid='container'>
  //         <EditorV3
  //           id='test-editor'
  //           input={mockContent.jsonString}
  //           setText={mockSetText}
  //           forceUpdate
  //         />
  //       </div>,
  //     );
  //   });
  //   const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
  //   const editorHolder = container.querySelector("#test-editor-editable") as HTMLDivElement;
  //   expect(editorHolder).toBeInTheDocument();
  //   await user.click(editorHolder.querySelector("span") as HTMLSpanElement);
  //   await expect(
  //     user.paste({
  //       getData: (type: string) => {
  //         if (type === "data/aiev3") {
  //           return "NotJSONString";
  //         }
  //       },
  //     } as DataTransfer),
  //   ).rejects.toThrow();
  // });
});
