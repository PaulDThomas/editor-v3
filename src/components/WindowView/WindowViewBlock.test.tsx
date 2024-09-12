import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { textBlockFactory } from "../../classes/textBlockFactory";
import { WindowViewBlock } from "./WindowViewBlock";
import { EditorV3AtBlock, EditorV3TextBlock } from "../../classes";
import { EditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";

jest.mock("./WindowViewSelectOptions");

describe("WindowViewBlock", () => {
  const user = userEvent.setup({ delay: null });

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();
    const mockTb = textBlockFactory({ text: "test" });
    render(
      <WindowViewBlock
        contentProps={defaultContentProps}
        textBlock={mockTb}
        editable={true}
        setTextBlock={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).toBeInTheDocument();
    expect(screen.queryByText("At")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    const mockTb = textBlockFactory({
      text: "test",
      type: "text",
      label: undefined,
      style: undefined,
    });
    render(
      <WindowViewBlock
        contentProps={defaultContentProps}
        textBlock={mockTb}
        editable={true}
        setTextBlock={mockSet}
      />,
    );

    expect(screen.queryByLabelText("Type")).toBeInTheDocument();
    expect(screen.queryByLabelText("At")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Style")).not.toBeInTheDocument();
    const labelInput = screen.queryByLabelText("Label") as HTMLInputElement;
    expect(labelInput).toBeInTheDocument();
    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    expect(textInput).toHaveDisplayValue(["test"]);
    expect(textInput).not.toBeDisabled();

    await user.type(labelInput, "new label");
    fireEvent.blur(labelInput);
    expect(mockSet.mock.calls[0][0].data).toEqual(
      new EditorV3TextBlock({
        type: "text",
        text: "test",
        label: "new label",
        style: undefined,
      }).data,
    );

    await user.type(textInput, " - stunning volley Yeboah!!! ⚽");
    fireEvent.blur(textInput);
    // TODO: This should be 1, but it's 2. Why?
    expect(mockSet.mock.calls[2][0].data).toEqual(
      new EditorV3TextBlock({
        type: "text",
        text: "test - stunning volley Yeboah!!! ⚽",
        label: undefined,
        style: undefined,
      }).data,
    );
  });

  test("At render and update", async () => {
    const mockSet = jest.fn();
    const mockTb = textBlockFactory({
      text: "@test",
      style: "blue",
      type: "at",
    });
    render(
      <WindowViewBlock
        contentProps={{
          ...defaultContentProps,
          atListFunction: jest.fn(),
          styles: { blue: { color: "blue" } },
        }}
        textBlock={mockTb}
        editable={true}
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
    expect(mockSet.mock.calls[0][0].data).toEqual(
      new EditorV3AtBlock({
        type: "at",
        text: "@test",
        style: undefined,
        label: undefined,
      }).data,
    );

    await user.selectOptions(typeSelect, "Text");
    expect(mockSet.mock.calls[1][0].data).toEqual(
      new EditorV3TextBlock({
        type: "text",
        text: "@test",
        style: "blue",
        label: undefined,
      }).data,
    );
  });

  test("Select render and update", async () => {
    const mockSet = jest.fn();
    const mockTb = textBlockFactory({
      text: "current",
      type: "select",
      availableOptions: [
        { text: "post", data: { noStyle: "true" } },
        { text: "current", data: { noStyle: "true" } },
        { text: "future", data: { noStyle: "true" } },
      ],
    });
    render(
      <WindowViewBlock
        contentProps={{
          ...defaultContentProps,
          styles: { blue: { color: "blue" } },
        }}
        editable={true}
        textBlock={mockTb}
        setTextBlock={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText("Available options") as HTMLInputElement;
    expect(availableOptionsInput).toBeInTheDocument();
    await user.clear(availableOptionsInput);
    await user.type(availableOptionsInput, "bring\nme\ncoffee");
    fireEvent.blur(availableOptionsInput);
    expect(mockSet.mock.calls[0][0].data).toEqual(
      new EditorV3SelectBlock({
        type: "select",
        text: "current",
        availableOptions: [
          { text: "bring", data: { noStyle: "true" } },
          { text: "me", data: { noStyle: "true" } },
          { text: "coffee", data: { noStyle: "true" } },
        ],
      }).data,
    );
  });
});
