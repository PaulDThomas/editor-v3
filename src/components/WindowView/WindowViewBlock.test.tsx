import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowViewBlock } from "./WindowViewBlock";

jest.mock("./WindowViewSelectOptions");

describe("WindowViewBlock", () => {
  const user = userEvent.setup();

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();

    render(
      <WindowViewBlock
        contentProps={defaultContentProps}
        textBlock={{ text: "test" }}
        editable={true}
        setTextBlock={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).toBeInTheDocument();
    expect(screen.queryByText("At")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlock
        contentProps={defaultContentProps}
        textBlock={{ text: "test", type: "text", label: undefined, style: undefined }}
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
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "text",
      text: "test",
      label: "new label",
      style: undefined,
    });

    await user.type(textInput, " - stunning volley Yeboah!!! ⚽");
    fireEvent.blur(textInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "text",
      text: "test - stunning volley Yeboah!!! ⚽",
      label: undefined,
      style: undefined,
    });
  });

  test("At render and update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlock
        contentProps={{
          ...defaultContentProps,
          atListFunction: jest.fn(),
          styles: { blue: { color: "blue" } },
        }}
        textBlock={{
          text: "@test",
          style: "blue",
          type: "at",
        }}
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
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "at",
      text: "@test",
      style: undefined,
      label: undefined,
    });

    await user.selectOptions(typeSelect, "Text");
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "text",
      text: "@test",
      style: "blue",
      label: undefined,
    });
  });

  test("Select render and update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlock
        contentProps={{
          ...defaultContentProps,
          styles: { blue: { color: "blue" } },
        }}
        editable={true}
        textBlock={{
          text: "current",
          type: "select",
          availableOptions: [
            { text: "post", data: { noStyle: "true" } },
            { text: "current", data: { noStyle: "true" } },
            { text: "future", data: { noStyle: "true" } },
          ],
        }}
        setTextBlock={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText("Available options") as HTMLInputElement;
    expect(availableOptionsInput).toBeInTheDocument();
    await user.clear(availableOptionsInput);
    await user.type(availableOptionsInput, "bring\nme\ncoffee");
    fireEvent.blur(availableOptionsInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "select",
      text: "current",
      availableOptions: [
        { text: "bring", data: { noStyle: "true" } },
        { text: "me", data: { noStyle: "true" } },
        { text: "coffee", data: { noStyle: "true" } },
      ],
    });
  });
});
