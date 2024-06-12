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
        setTextBlock={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlock
        contentProps={defaultContentProps}
        textBlock={{ text: "test", type: "text", label: undefined, style: undefined }}
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
        textBlock={{
          text: "current",
          type: "select",
          selectedOption: "current",
          availableOptions: [
            { text: "post", data: { text: "post", noStyle: "true" } },
            { text: "current", data: { text: "current", noStyle: "true" } },
            { text: "future", data: { text: "future", noStyle: "true" } },
          ],
        }}
        setTextBlock={mockSet}
      />,
    );
    const selectedOptionInput = screen.queryByTestId(/selected-:r/) as HTMLInputElement;
    expect(selectedOptionInput).toBeInTheDocument();
    await user.clear(selectedOptionInput);
    await user.type(selectedOptionInput, "future");
    fireEvent.blur(selectedOptionInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      type: "select",
      text: "future",
      selectedOption: "future",
      availableOptions: [
        { text: "post", data: { text: "post", noStyle: "true" } },
        { text: "current", data: { text: "current", noStyle: "true" } },
        { text: "future", data: { text: "future", noStyle: "true" } },
      ],
    });
  });
});
