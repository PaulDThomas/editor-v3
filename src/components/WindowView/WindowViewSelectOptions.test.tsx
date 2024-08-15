import { fireEvent, render, screen } from "@testing-library/react";
import * as ed from "../EditorV3";
import { EditorV3Props } from "../EditorV3";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";

jest.mock("../ObjectEditor/Expander");

describe("WindowViewLine", () => {
  test("No render without for none select", async () => {
    const mockSet = jest.fn();
    const { container } = render(
      <WindowViewSelectOptions
        type="text"
        options={{}}
        editable={true}
        setOptions={mockSet}
      />,
    );
    expect(container.querySelector(".noHeight")).toBeInTheDocument();
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
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        editable={true}
        setOptions={mockSet}
      />,
    );
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    fireEvent.blur(availableOptionsInput);
    expect(mockSet).toHaveBeenLastCalledWith({
      availableOptions: [
        { text: "test1", data: { style: "green" } },
        { text: "test2", data: { style: "blue" } },
        { text: "test3", data: { noStyle: "true" } },
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
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        editable={true}
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
          availableOptions: [
            { text: "test1", data: { style: "green" } },
            { text: "test2", data: { style: "blue" } },
          ],
        }}
        editable={true}
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
