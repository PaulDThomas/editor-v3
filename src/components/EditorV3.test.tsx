import { ContextWindowStack } from "@asup/context-menu";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, useState } from "react";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align, IEditorV3 } from "../classes/interface";
import { defaultMarkdownSettings } from "../classes/defaultMarkdownSettings";
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
  const user = userEvent.setup({ delay: null });
  test("Draw and fire cursor events", async () => {
    render(
      <div data-testid="container">
        <EditorV3
          id="test-editor"
          input={mockContent}
          customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
          allowNewLine
          textAlignment={EditorV3Align.left}
        />
      </div>,
    );
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(container.outerHTML).toMatchSnapshot();
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

  test("Render two locked blocks", async () => {
    const TestApp = () => {
      const [lockedBlocks, setLockedBlocks] = useState<IEditorV3>({
        lines: [{ textBlocks: [{ text: "Locked block", style: "Red" }] }],
      });
      return (
        <EditorV3
          id="locked"
          input={lockedBlocks}
          setObject={(ret) => {
            setLockedBlocks(ret);
          }}
          customStyleMap={{
            Green: { backgroundColor: "green" },
            Blue: { color: "blue" },
            Red: { backgroundColor: "red", color: "white", isLocked: true },
          }}
        />
      );
    };
    render(<TestApp />);
    expect(screen).toMatchSnapshot();
  });

  test("Backspace", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setObject={(ret) => {
          mockSetObject(ret);
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
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();

    await user.click(editor.querySelector(".aiev3-editing") as HTMLElement);
    await user.keyboard("{Home}{End}{Backspace}");
    fireEvent.blur(editor);

    expect(mockSetText).toHaveBeenCalledTimes(1);
    expect(mockSetText).toHaveBeenLastCalledWith("34.4\n\nx.xx");
    expect(mockSetObject).toHaveBeenCalledTimes(1);
    expect(mockSetObject).toHaveBeenLastCalledWith({
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
    });
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Enter", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setObject={(ret) => {
          mockSetObject(ret);
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

    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editor.querySelector(".aiev3-editing") as HTMLElement);
    await user.keyboard("{Home}{ArrowRight}{ArrowRight}{Enter}");
    fireEvent.blur(editor);

    expect(mockSetText).toHaveBeenCalledTimes(1);
    expect(mockSetText).toHaveBeenLastCalledWith("34\n.45\n\nx.xx");
    expect(mockSetObject).toHaveBeenCalledTimes(1);
    expect(mockSetObject).toHaveBeenLastCalledWith({
      contentProps: {
        textAlignment: "decimal",
        decimalAlignPercent: 70,
        allowNewLine: true,
      },
      lines: [
        {
          textBlocks: [{ text: "34", type: "text" }],
        },
        {
          textBlocks: [{ text: ".45", type: "text" }],
        },
        {
          textBlocks: [{ text: "", type: "text" }],
        },
        {
          textBlocks: [{ text: "x.xx", style: "shiny", type: "text" }],
        },
      ],
    });
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Delete", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setObject={(ret) => {
          mockSetObject(ret);
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

    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editor.querySelector(".aiev3-editing") as HTMLElement);
    await user.keyboard("{Home}{Delete}{Delete}{Delete}");
    fireEvent.blur(editor);

    expect(mockSetText).toHaveBeenCalledTimes(1);
    expect(mockSetText).toHaveBeenNthCalledWith(1, "45\n\nx.xx");
    expect(mockSetObject.mock.calls[0][0]).toEqual({
      contentProps: {
        allowNewLine: true,
        decimalAlignPercent: 70,
        textAlignment: "decimal",
      },
      lines: [
        {
          textBlocks: [{ text: "45", type: "text" }],
        },
        {
          textBlocks: [{ text: "", type: "text" }],
        },
        {
          textBlocks: [{ text: "x.xx", style: "shiny", type: "text" }],
        },
      ],
    });
    expect(editor.outerHTML).toMatchSnapshot();
  });
});

describe("Menu styling - add", () => {
  const user = userEvent.setup({ delay: null });
  test("Add style", async () => {
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setText={mockSetText}
        style={{ width: "200px" }}
        textAlignment={EditorV3Align.left}
        allowNewLine
        customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
        resize
      />,
    );
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    // Go to start of text
    await user.click(editor.querySelectorAll("span")[0] as Element);
    await user.keyboard("{Home}{End}");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 0,
      initialChar: 5,
      focusLine: 0,
      focusChar: 5,
    });
    // Need to click twice, first click normalised the value
    await user.keyboard("{ArrowLeft}");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 0,
      initialChar: 4,
      focusLine: 0,
      focusChar: 4,
    });
    expect(editor.querySelectorAll("span")[0]).toHaveClass("is-active");
    // Check clicked span is active
    await user.keyboard("{ArrowLeft}");
    expect(editor.querySelectorAll("span")[0]).toHaveClass("is-active");
    await user.keyboard("{Control>}{Home}{/Control}{Home}{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 0,
      initialChar: 5,
      focusLine: 0,
      focusChar: 0,
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
  const user = userEvent.setup({ delay: null });
  test("Change style", async () => {
    const mockSetText = jest.fn();
    render(
      <div data-testid="container">
        <EditorV3
          id="test-editor"
          input={mockContent}
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
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelectorAll("span")[0] as HTMLSpanElement);
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      initialLine: 2,
      initialChar: 4,
      focusLine: 2,
      focusChar: 0,
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
    expect(mockSetText).not.toHaveBeenCalled();
  });
});

describe("Menu styling - remove", () => {
  const user = userEvent.setup({ delay: null });
  test("Remove style", async () => {
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
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
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    // Go to start of text
    await user.click(editor.querySelectorAll("span")[2] as HTMLSpanElement);
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 2,
      initialChar: 4,
      focusLine: 2,
      focusChar: 0,
    });
    // Click remove
    fireEvent.contextMenu(editor.querySelectorAll("span")[2]);
    expect(screen.queryByText("Remove style")).toBeInTheDocument();
    const removeStyle = screen.getByLabelText("Remove style");
    await user.click(removeStyle);
    expect(editor.querySelectorAll("span").length).toEqual(3);
    expect(editor.querySelectorAll("span")[2]).not.toHaveClass("editorv3style-shiny");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 2,
      initialChar: 4,
      focusLine: 2,
      focusChar: 4,
    });
  });
});

describe("Menu styling - markdown", () => {
  const user = userEvent.setup({ delay: null });
  test("Show markdown", async () => {
    render(
      <div data-testid="container">
        <EditorV3
          id="test-editor"
          input={mockContent}
          setObject={jest.fn()}
          style={{ width: "200px" }}
          allowNewLine
          customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
          allowMarkdown
        />
      </div>,
    );
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
  const user = userEvent.setup({ delay: null });
  test("Cut", async () => {
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setText={mockSetText}
        style={{ width: "200px" }}
        textAlignment={EditorV3Align.center}
        allowNewLine
        customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
        resize
      />,
    );
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    // Go to start of text
    await user.keyboard("{Control>}{Home}{/Control}{Home}{Shift>}{ArrowRight}{ArrowRight}{/Shift}");
    const thingCut = await user.cut();
    expect(thingCut?.getData("text/plain")).toEqual("34");
    expect(thingCut?.getData("text/html")).toMatchSnapshot();
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
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenLastCalledWith(".45\n\nx.xx");
  });

  test("Paste", async () => {
    const mockSetText = jest.fn();
    render(
      <EditorV3
        data-testid="test-editor"
        id="test-editor"
        input={mockContent}
        setText={mockSetText}
        style={{ width: "200px" }}
        textAlignment={EditorV3Align.center}
        allowNewLine
        customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
        resize
      />,
    );
    // Get component
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    await user.keyboard("{ArrowRight}");
    // Go to start of text
    await user.paste("34");
    expect(getCaretPosition(editor)).toEqual({
      initialLine: 2,
      initialChar: 6,
      focusLine: 2,
      focusChar: 6,
    });
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenLastCalledWith("34.45\n\nx.xx34");
  });

  test("Paste into single line", async () => {
    const mockSetText1 = jest.fn();
    const mockSetText2 = jest.fn();
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

  test("Stop drag and drop", async () => {
    await act(async () =>
      render(
        <div data-testid="container">
          <EditorV3
            id="test-editor"
            input={"Initial\ntext\n"}
            setText={jest.fn()}
            style={{ width: "200px" }}
            allowNewLine
            textAlignment={EditorV3Align.center}
          />
        </div>,
      ),
    );
    // Get components
    const editor = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    // Click to select all
    await user.click(editor.querySelector("span") as HTMLSpanElement);
    fireEvent.dragStart(editor.querySelector("span") as HTMLSpanElement);
    expect(editor.querySelector("span")?.hasAttribute("draggable")).toBeFalsy();
  });
});

describe("Edge events", () => {
  const user = userEvent.setup({ delay: null });
  test("Initial focus", async () => {
    const mockSetText = jest.fn();
    const { container } = render(
      <EditorV3
        id="test-editor"
        input={mockContent}
        setText={mockSetText}
      />,
    );
    const editorHolder = container.querySelector("#test-editor-editable") as HTMLDivElement;
    expect(editorHolder).toBeInTheDocument();
    fireEvent.focus(editorHolder);
  });
  test("Paste error - cannot work out how to accurately throw", async () => {
    const mockSetText = jest.fn();
    render(
      <div data-testid="container">
        <EditorV3
          id="test-editor"
          input={mockContent}
          setText={mockSetText}
        />
      </div>,
    );
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    const editorHolder = container.querySelector("#test-editor-editable") as HTMLDivElement;
    expect(editorHolder).toBeInTheDocument();
    await user.click(editorHolder.querySelector("span") as HTMLSpanElement);
  });

  test("First letter in locked block is locked", async () => {
    const mockContent = new EditorV3Content({
      lines: [
        {
          textBlocks: [
            { text: "Locked Block", type: "text", style: "green", isLocked: true },
            { text: "Another locked block", type: "text", style: "green", isLocked: true },
          ],
        },
      ],
    });
    const mockSet = jest.fn();
    const greenStyle = {
      green: { backgroundColor: "green", isLocked: true },
    };
    const { container } = render(
      <>
        <EditorV3
          data-testid="locked"
          id="locked"
          input={mockContent}
          setObject={mockSet}
          customStyleMap={greenStyle}
        />
        <button
          data-testid="debug"
          onClick={() => {
            const debugEvent = new CustomEvent("editorv3debug", {
              bubbles: true,
            });
            const editable = container.querySelector("#locked .aiev3-editing") as HTMLDivElement;
            editable.dispatchEvent(debugEvent);
          }}
        />
      </>,
    );
    const lockedSpan = screen.queryByText(/Locked/) as HTMLElement;
    const blockSpan = screen.queryByText(/Block/);
    expect(lockedSpan).toBeInTheDocument();
    expect(blockSpan).toBeInTheDocument();
    expect(lockedSpan).toHaveClass("editorv3style-green");
    expect(lockedSpan.dataset.lineStartPosition).toEqual(blockSpan?.dataset.lineStartPosition);
    expect(screen.queryByText(/Another/)).toBeInTheDocument();
    await user.click(lockedSpan);
    await user.keyboard("{Home}{ArrowRight}x");
    const x = screen.queryByText("x") as HTMLSpanElement;
    expect(x).toBeInTheDocument();
    expect(x).not.toHaveClass("editorv3style-green");
  });
});

describe("Select all", () => {
  const user = userEvent.setup({ delay: null });
  test("Programmer notes", async () => {
    const mockSet = jest.fn();
    render(
      <EditorV3
        data-testid="programmernotes"
        id="programmernotes"
        input={"Item 2 programmer notes"}
        setObject={mockSet}
      />,
    );
    const editable = screen
      .queryByTestId("programmernotes")
      ?.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 23,
    });
    await user.keyboard("{Delete}");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 0,
    });
    await user.keyboard("New programmer notes");
    // Select all
    await user.keyboard("{Control>}{a}{/Control}");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 20,
    });
    fireEvent.blur(editable);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("programmer")).toBeInTheDocument();
    expect(screen.getByText("notes")).toBeInTheDocument();
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet.mock.calls[0][0]).toEqual({
      lines: [
        {
          textBlocks: [{ text: "New programmer notes", type: "text" }],
        },
      ],
    });
  });

  test("Cannot type in locked block + extra", async () => {
    const mockSet = jest.fn();
    const greenStyle = { green: { backgroundColor: "green", isLocked: true } };
    render(
      <EditorV3
        data-testid="locked"
        id="locked"
        input={{
          lines: [
            {
              textBlocks: [
                { text: "Locked block", type: "text", style: "green", isLocked: true },
                {
                  text: " - unlocked",
                  type: "text",
                },
              ],
            },
          ],
        }}
        setObject={mockSet}
        customStyleMap={greenStyle}
      />,
    );
    const editable = screen
      .queryByTestId("locked")
      ?.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    // Try and type into everything selected
    await user.keyboard("x");
    expect(screen.queryByText(/Locked/)).toBeInTheDocument();
    expect(screen.queryByText(/block/)).toBeInTheDocument();
    // Try and type after removing whole selection
    await user.keyboard("{Home}x");
    fireEvent.blur(editable);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet.mock.calls[0][0]).toEqual({
      lines: [
        {
          textBlocks: [
            { text: "x", type: "text" },
            { text: "Locked block", type: "text", style: "green", isLocked: true },
            { text: " - unlocked", type: "text" },
          ],
        },
      ],
      contentProps: { styles: greenStyle },
    });
  });
});

describe("Undo/redo", () => {
  const user = userEvent.setup({ delay: null });
  const TestContainer = () => {
    const [input, setInput] = useState<IEditorV3>(new EditorV3Content());
    return (
      <div>
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setObject={(ret) => {
            setInput(ret);
          }}
          allowMarkdown
        />
      </div>
    );
  };
  test("Undo/redo", async () => {
    render(<TestContainer />);
    const editable = screen
      .queryByTestId("test-editor")
      ?.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    expect(getCaretPosition(editable)).toEqual(null);
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 0,
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
  const user = userEvent.setup({ delay: null });
  const TestContainer = () => {
    const [input, setInput] = useState("Before");
    const [textAlignment, setTextAlignment] = useState<EditorV3Align>(EditorV3Align.left);
    const [decimalAlignPercent, setDecimalAlignPercent] = useState<number>(60);
    const [styles, setStyles] = useState<Record<string, React.CSSProperties>>({
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
          setText={setInput}
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
    render(<TestContainer />);
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-input");
    await user.click(changeInput);
    expect(screen.queryByText("New")).toBeInTheDocument();
    expect(screen.queryByText("<<shiny::input>>")).toBeInTheDocument();
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Change alignment", async () => {
    render(<TestContainer />);
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-text-alignment");
    await user.click(changeInput);
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Change decimal align percent", async () => {
    render(<TestContainer />);
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-decimal-align-percent");
    await user.click(changeInput);
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Change styles", async () => {
    render(<TestContainer />);
    const editor = screen.getByTestId("editor");
    expect(screen.queryByText("Before")).toBeInTheDocument();
    const changeInput = screen.getByTestId("change-styles");
    await user.click(changeInput);
    expect(editor.outerHTML).toMatchSnapshot();
  });

  test("Change markdown settings", async () => {
    render(<TestContainer />);
    const editor = screen.getByTestId("editor");
    // Click show markdown
    fireEvent.contextMenu(editor.querySelectorAll("span")[0] as HTMLSpanElement);
    let showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    expect(editor.outerHTML).toMatchSnapshot();
    // Update text
    await user.click(screen.getByTestId("change-input"));
    expect(editor.outerHTML).toMatchSnapshot();
    // Hide markdown
    fireEvent.contextMenu(editor.querySelectorAll(".aiev3-markdown-line")[0] as HTMLDivElement);
    const hideMarkdown = screen.getByLabelText("Hide markdown");
    await user.click(hideMarkdown);
    // Change markdown and show again
    await user.click(screen.getByTestId("change-markdown-settings"));
    fireEvent.contextMenu(editor.querySelectorAll("span")[0] as HTMLSpanElement);
    showMarkdown = screen.getByLabelText("Show markdown");
    await user.click(showMarkdown);
    expect(editor.outerHTML).toMatchSnapshot();
  });
});

describe("Add at block and escape out", () => {
  const user = userEvent.setup({ delay: null });
  const TestEditor = (props: {
    setText: (ret: string) => void;
    setObject: (ret: object) => void;
    maxAtListLength?: number;
  }) => {
    const [input, setInput] = useState<IEditorV3>(new EditorV3Content("Initial text"));
    return (
      <>
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setObject={(ret) => {
            setInput(ret);
            props.setObject(ret);
          }}
          setText={props.setText}
          atListFunction={async (typedString: string) => {
            const atList = [
              { text: "@Hello", data: { id: "1" } },
              { text: "@Lovely", data: { id: "2" } },
              {
                text: "@People",
                data: { id: "3" },
              },
              ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)).map(
                (letter) => ({ text: `@${letter.repeat(2)}`, data: { ix: letter } }),
              ),
            ];
            return atList.filter((at) => at.text.toLowerCase().includes(typedString.toLowerCase()));
          }}
          maxAtListLength={props.maxAtListLength}
        />
      </>
    );
  };

  test("Type at block", async () => {
    const mockSetText = jest.fn();
    const mockSetObject = jest.fn();
    render(
      <TestEditor
        setObject={mockSetObject}
        setText={mockSetText}
      />,
    );
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    await user.keyboard("@Hello{Escape} world");
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenLastCalledWith("@Hello world");
    expect(mockSetObject).toHaveBeenLastCalledWith({
      lines: [
        {
          textBlocks: [
            // Currently will not have atData if not clicked on - need to fix
            { text: "@Hello", type: "at", isLocked: true },
            { text: " world", type: "text" },
          ],
        },
      ],
    });
  });

  test("Change at list length", async () => {
    const mockSetText = jest.fn();
    const mockSetObject = jest.fn();
    render(
      <TestEditor
        setObject={mockSetObject}
        setText={mockSetText}
        maxAtListLength={5}
      />,
    );
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    await user.keyboard("@");

    await act(async () => jest.runAllTimers());
    expect(document.body.querySelectorAll("li.aiev3-drop-item").length).toEqual(5);
    expect(screen.queryByText("...24 more")).toBeInTheDocument();
    expect(document.body.innerHTML).toMatchSnapshot();
  });
});

describe("Move left to start over at block", () => {
  test("Don't merge blocks infront", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const TestEditor = () => {
      const [input, setInput] = useState<IEditorV3>({
        lines: [
          {
            textBlocks: [
              {
                text: "@initial",
                type: "at",
                isLocked: true,
              },
              {
                text: " thing ",
                type: "text",
              },
              {
                text: "@here",
                type: "at",
              },
            ],
          },
        ],
      });
      return (
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setObject={(ret) => {
            setInput(ret);
            mockSetObject(ret);
          }}
          atListFunction={async (typedString: string) => {
            const atList = [{ text: "@Hello" }, { text: "@Lovely" }, { text: "@People" }];
            return atList.filter((at) => at.text.toLowerCase().includes(typedString.toLowerCase()));
          }}
        />
      );
    };
    await act(async () => render(<TestEditor />));
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    expect(screen.queryByTestId("test-editor")).toMatchSnapshot();
    await user.click(editable);
    await user.keyboard("{Home}@ {Escape}");
    fireEvent.blur(editor);
    expect(mockSetObject).toHaveBeenCalledTimes(1);
    expect(mockSetObject).toHaveBeenLastCalledWith({
      lines: [
        {
          textBlocks: [
            {
              isLocked: true,
              label: undefined,
              style: undefined,
              text: "@ ",
              type: "at",
            },
            {
              isLocked: true,
              label: undefined,
              style: undefined,
              text: "@initial",
              type: "at",
            },
            {
              isLocked: undefined,
              label: undefined,
              style: undefined,
              text: " thing ",
              type: "text",
            },
            {
              isLocked: true,
              label: undefined,
              style: undefined,
              text: "@here",
              type: "at",
            },
          ],
        },
      ],
    });
  });

  test("Arrow left", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const TestEditor = () => {
      const [input, setInput] = useState<IEditorV3>({
        lines: [
          {
            textBlocks: [
              {
                text: "@initial",
                type: "at",
                isLocked: true,
              },
              {
                text: " thing ",
                type: "text",
              },
              {
                text: "@here",
                type: "at",
              },
            ],
          },
        ],
      });
      return (
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setObject={(ret) => {
            setInput(ret);
            mockSetObject(ret);
          }}
          atListFunction={async (typedString: string) => {
            const atList = [{ text: "@Hello" }, { text: "@Lovely" }, { text: "@People" }];
            return atList.filter((at) => at.text.toLowerCase().includes(typedString.toLowerCase()));
          }}
        />
      );
    };
    render(<TestEditor />);
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    expect(screen.queryByTestId("test-editor")).toMatchSnapshot();
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 20,
    });
    await user.keyboard("{Home}");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 0,
    });
    await user.keyboard("@Hello{Escape}{ArrowLeft}{ArrowLeft} world ");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 7,
      focusLine: 0,
      focusChar: 7,
    });
    fireEvent.blur(editor);
    expect(mockSetObject.mock.calls[0][0]).toEqual({
      lines: [
        {
          textBlocks: [
            { text: " world ", type: "text" },
            { text: "@Hello", type: "at", isLocked: true },
            { text: "@initial", type: "at", isLocked: true },
            { text: " thing ", type: "text" },
            { text: "@here", type: "at", isLocked: true },
          ],
        },
      ],
    });
  });

  test("Remove at block between spaces", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSetObject = jest.fn();
    const TestEditor = () => {
      const [input, setInput] = useState<IEditorV3>({
        lines: [
          {
            textBlocks: [
              {
                text: "0 ",
                type: "text",
              },
              {
                text: "@hello",
                type: "at",
                isLocked: true,
              },
              {
                text: "  world",
                type: "text",
              },
            ],
          },
        ],
      });
      return (
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input={input}
          setObject={(ret) => {
            setInput(ret);
            mockSetObject(ret);
          }}
          atListFunction={async (typedString: string) => {
            const atList = [{ text: "@Hello" }, { text: "@Lovely" }, { text: "@People" }];
            return atList.filter((at) => at.text.toLowerCase().includes(typedString.toLowerCase()));
          }}
        />
      );
    };
    render(<TestEditor />);
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    expect(screen.queryByTestId("test-editor")).toMatchSnapshot();
    await user.click(editable);
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 15,
    });
    await user.keyboard("{ArrowLeft}{ArrowRight}{ArrowRight}");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 2,
      focusLine: 0,
      focusChar: 2,
    });
    await user.keyboard("{Delete}");
    expect(getCaretPosition(editable)).toEqual({
      initialLine: 0,
      initialChar: 2,
      focusLine: 0,
      focusChar: 2,
    });
  });
});

describe("Window view", () => {
  const user = userEvent.setup({ delay: null });
  test("Show window view", async () => {
    render(
      <ContextWindowStack>
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input="Initial text"
          allowWindowView
        />
      </ContextWindowStack>,
    );
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    await user.click(editable);
    await user.keyboard("{ArrowRight}");
    fireEvent.contextMenu(editable);
    const showWindowView = screen.getByLabelText("Show window view");
    await user.click(showWindowView);
    await act(async () => jest.runAllTimers());
    expect(screen.queryByText("Editor contents")).toBeInTheDocument();

    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    await user.type(textInput, " - added text");
  });
});

describe("Check custom refresh event", () => {
  test("Click on select block", async () => {
    const mockSet = jest.fn();
    await act(async () =>
      render(
        <EditorV3
          data-testid="test-editor"
          id="test-editor"
          input="Initial text"
          setText={mockSet}
          resize="vertical"
        />,
      ),
    );
    const editor = screen.queryByTestId("test-editor") as HTMLDivElement;
    expect(editor).toBeInTheDocument();
    const editable = editor.querySelector(".aiev3-editing") as HTMLDivElement;
    expect(editable).toBeInTheDocument();
    // Focus firtt
    await act(async () => {
      fireEvent.focus(editable);
    });
    // Hard coded javascript text change + event
    await act(async () => {
      const text = editable.querySelectorAll("span")[1] as HTMLSpanElement;
      expect(text).toBeInTheDocument();
      text.innerHTML = "text with extra";
      const refreshEvent = new CustomEvent("editorv3refresh", {
        bubbles: true,
        detail: {
          target: text,
        },
      });
      text.dispatchEvent(refreshEvent);
      jest.runAllTimers();
    });
    // Blur and check update has been picked up
    await act(async () => {
      fireEvent.blur(editable);
    });
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenLastCalledWith("Initial text with extra");
  });
});
