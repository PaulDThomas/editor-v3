import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3AtBlock, EditorV3Content, EditorV3TextBlock } from "../classes";
import { WindowViewBlock } from "./WindowViewBlock";

describe("WindowViewBlock", () => {
  const user = userEvent.setup();

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <WindowViewBlock
        state={{
          content,
          focus: false,
        }}
        lineIndex={0}
        blockIndex={12}
        setTextBlock={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <WindowViewBlock
        state={{
          content,
          focus: false,
        }}
        lineIndex={0}
        blockIndex={0}
        setTextBlock={mockSet}
      />,
    );

    expect(screen.queryByLabelText("Type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Style")).not.toBeInTheDocument();
    const labelInput = screen.queryByLabelText("Label") as HTMLInputElement;
    expect(labelInput).toBeInTheDocument();
    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    expect(textInput).toHaveDisplayValue(["test"]);
    expect(textInput).not.toBeDisabled();

    await user.type(labelInput, "new label");
    fireEvent.blur(labelInput);
    const call0 = mockSet.mock.calls[0][0];
    expect(call0).toBeInstanceOf(EditorV3TextBlock);
    expect(call0.type).toEqual("text");
    expect(call0.text).toEqual("test");
    expect(call0.label).toEqual("new label");
    expect(call0.style).toEqual(undefined);

    await user.type(textInput, " - stunning volley Yeboah!!! ⚽");
    fireEvent.blur(textInput);
    const call1 = mockSet.mock.calls[mockSet.mock.calls.length - 1][0];
    expect(call1).toBeInstanceOf(EditorV3TextBlock);
    expect(call1.type).toEqual("text");
    expect(call1.text).toEqual("test - stunning volley Yeboah!!! ⚽");
    expect(call1.label).toEqual(undefined);
    expect(call1.style).toEqual(undefined);
  });

  test("At render and update", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content(
      {
        lines: [
          {
            textBlocks: [
              {
                text: "@test",
                style: "blue",
                type: "at",
              },
            ],
          },
        ],
      },
      { atListFunction: jest.fn(), styles: { blue: { color: "blue" } } },
    );
    render(
      <WindowViewBlock
        state={{
          content,
          focus: false,
        }}
        lineIndex={0}
        blockIndex={0}
        setTextBlock={mockSet}
      />,
    );

    const typeSelect = screen.queryByLabelText("Type") as HTMLSelectElement;
    expect(typeSelect).toBeInTheDocument();
    expect(typeSelect).toHaveDisplayValue("At");
    const styleSelect = screen.queryByLabelText("Style") as HTMLSelectElement;
    expect(styleSelect).toBeInTheDocument();
    expect(styleSelect).toHaveDisplayValue(["blue"]);
    expect(screen.queryByLabelText("Label")).toBeInTheDocument();
    expect(screen.queryByLabelText("Label")).toHaveDisplayValue([""]);
    expect(screen.queryByLabelText("Text")).toBeInTheDocument();
    expect(screen.queryByLabelText("Text")).toHaveDisplayValue(["@test"]);
    expect(screen.queryByLabelText("Text")).toBeDisabled();

    await user.selectOptions(styleSelect, "None");
    const call0 = mockSet.mock.calls[0][0];
    expect(call0).toBeInstanceOf(EditorV3AtBlock);
    expect(call0.type).toEqual("at");
    expect(call0.text).toEqual("@test");
    expect(call0.label).toEqual(undefined);
    expect(call0.style).toEqual(undefined);

    await user.selectOptions(typeSelect, "Text");
    const call1 = mockSet.mock.calls[1][0];
    expect(call1).toBeInstanceOf(EditorV3TextBlock);
    expect(call1.type).toEqual("text");
    expect(call1.text).toEqual("@test");
    expect(call1.label).toEqual(undefined);
    expect(call1.style).toEqual("blue");
  });
});
