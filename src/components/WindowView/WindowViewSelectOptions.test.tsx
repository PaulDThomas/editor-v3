import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";
import { EditorV3Props } from "../EditorV3";
import * as ed from "../EditorV3";

describe("WindowViewLine", () => {
  const user = userEvent.setup();

  test("No render without for none select", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewSelectOptions
        type="text"
        options={{}}
        setOptions={mockSet}
      />,
    );
    const selectedOptionInput = screen.queryByLabelText("Selected option") as HTMLInputElement;
    expect(selectedOptionInput).toBeInTheDocument();
    expect(selectedOptionInput.closest(".noHeight")).toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewSelectOptions
        type="select"
        options={{
          selectedOption: "test2",
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        setOptions={mockSet}
      />,
    );
    const selectedOptionInput = screen.queryByLabelText("Selected option") as HTMLInputElement;
    expect(selectedOptionInput).toBeInTheDocument();
    expect(selectedOptionInput.closest(".height")).toBeInTheDocument();
    expect(selectedOptionInput.value).toEqual("test2");
    await user.clear(selectedOptionInput);
    expect(screen.queryByText(/Required/)).toBeInTheDocument();
    await user.type(selectedOptionInput, "test1");
    fireEvent.blur(selectedOptionInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      selectedOption: "test1",
      availableOptions: [
        { text: "test1", data: { style: "green" } },
        { text: "test2", data: { style: "blue" } },
      ],
    });
  });

  test("Update available options", async () => {
    const mockSet = jest.fn();
    jest.spyOn(ed, "EditorV3").mockImplementation((props: EditorV3Props) => {
      return (
        <textarea
          id={props.id}
          data-testid={props.id}
          aria-label={props["aria-label"]}
          onBlur={() =>
            props.setObject &&
            props.setObject({
              lines: [
                { textBlocks: [{ type: "text", text: "test1", style: "green" }] },
                { textBlocks: [{ type: "text", text: "test2", style: "blue" }] },
                { textBlocks: [{ type: "text", text: "test3" }] },
              ],
            })
          }
        />
      );
    });
    render(
      <WindowViewSelectOptions
        type="select"
        options={{
          selectedOption: "test2",
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        setOptions={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    fireEvent.blur(availableOptionsInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      selectedOption: "test2",
      availableOptions: [
        { text: "test1", data: { text: "test1", style: "green" } },
        { text: "test2", data: { text: "test2", style: "blue" } },
        { text: "test3", data: { text: "test3", noStyle: "true" } },
      ],
    });
  });

  test("Missing available option", async () => {
    const mockSet = jest.fn();
    jest.spyOn(ed, "EditorV3").mockImplementation((props: EditorV3Props) => {
      return (
        <textarea
          id={props.id}
          data-testid={props.id}
          aria-label={props["aria-label"]}
          onBlur={() =>
            props.setObject &&
            props.setObject({
              lines: [
                { textBlocks: [{ type: "text", text: "test1", style: "green" }] },
                { textBlocks: [{ type: "text", text: "", style: "blue" }] },
                { textBlocks: [{ type: "text", text: "test3" }] },
              ],
            })
          }
        />
      );
    });
    render(
      <WindowViewSelectOptions
        type="select"
        options={{
          selectedOption: "test2",
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        setOptions={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    fireEvent.blur(availableOptionsInput);
    expect(screen.queryByText("Each line must have at least one character")).toBeInTheDocument();
  });

  test("Multiple styles option", async () => {
    const mockSet = jest.fn();
    jest.spyOn(ed, "EditorV3").mockImplementation((props: EditorV3Props) => {
      return (
        <textarea
          id={props.id}
          data-testid={props.id}
          aria-label={props["aria-label"]}
          onBlur={() =>
            props.setObject &&
            props.setObject({
              lines: [
                { textBlocks: [{ type: "text", text: "test1", style: "green" }] },
                {
                  textBlocks: [
                    { type: "text", text: "test2", style: "blue" },
                    { type: "text", text: "test2 more", style: "red" },
                  ],
                },
                { textBlocks: [{ type: "text", text: "test3" }] },
              ],
            })
          }
        />
      );
    });
    render(
      <WindowViewSelectOptions
        type="select"
        options={{
          selectedOption: "test2",
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        setOptions={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    fireEvent.blur(availableOptionsInput);
    expect(screen.queryByText("Each line must have only one style")).toBeInTheDocument();
  });
});
