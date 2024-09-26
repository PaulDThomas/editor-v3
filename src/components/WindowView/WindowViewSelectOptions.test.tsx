import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import * as ed from "../EditorV3";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowViewContext, WindowViewContextProps } from "./WindowView";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";
import { UPDATE_BLOCK_OPTIONS } from "./windowViewReducer";

describe("WindowViewSelectOptions", () => {
  const user = userEvent.setup({ delay: null });
  const mockContentProps = {
    ...defaultContentProps,
    styles: {
      shiny: { color: "pink" },
      green: { color: "green" },
      blue: { color: "blue" },
    },
  };
  const mockContext: WindowViewContextProps = {
    id: "test",
    lines: [
      {
        textBlocks: [
          {
            text: "selectior",
            type: "select",
            availableOptions: [
              { text: "test1", data: { style: "green" } },
              { text: "test2", data: { style: "blue" } },
            ],
          },
        ],
      },
      {
        textBlocks: [
          {
            text: "line 2 textBlock",
            type: "text",
          },
        ],
      },
    ],
    dispatch: jest.fn(),
    editable: true,
    contentProps: mockContentProps,
    includeAt: false,
  };

  test("No textBlock", async () => {
    const mockDispatch = jest.fn();
    const { container } = await act(async () =>
      render(
        <WindowViewContext.Provider
          value={{
            ...mockContext,
            dispatch: mockDispatch,
          }}
        >
          <WindowViewSelectOptions
            lineIndex={0}
            blockIndex={1}
          />
        </WindowViewContext.Provider>,
      ),
    );
    expect(container.querySelector(".noHeight")).not.toBeInTheDocument();
    expect(container.querySelector(".height")).not.toBeInTheDocument();
  });

  test("Not a selection block", async () => {
    const mockDispatch = jest.fn();
    const { container } = await act(async () =>
      render(
        <WindowViewContext.Provider
          value={{
            ...mockContext,
            dispatch: mockDispatch,
          }}
        >
          <WindowViewSelectOptions
            lineIndex={1}
            blockIndex={0}
          />
        </WindowViewContext.Provider>,
      ),
    );
    expect(container.querySelector(".noHeight")).toBeInTheDocument();
    expect(container.querySelector(".height")).not.toBeInTheDocument();
  });

  test("Update available options", async () => {
    const mockDispatch = jest.fn();
    const { container } = await act(async () =>
      render(
        <WindowViewContext.Provider value={{ ...mockContext, dispatch: mockDispatch }}>
          <WindowViewSelectOptions
            lineIndex={0}
            blockIndex={0}
          />
        </WindowViewContext.Provider>,
      ),
    );
    expect(container.querySelector(".noHeight")).not.toBeInTheDocument();
    expect(container.querySelector(".height")).toBeInTheDocument();
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    expect(availableOptionsInput.textContent).toBe("test1test2");
    // Update available options
    await user.click(availableOptionsInput.querySelector("div.aiev3-editing") as HTMLElement);
    await user.keyboard("{End}{Enter}test3");
    await act(async () => {
      fireEvent.blur(availableOptionsInput);
    });
    expect(mockDispatch).toHaveBeenLastCalledWith({
      operation: UPDATE_BLOCK_OPTIONS,
      lineIndex: 0,
      blockIndex: 0,
      blockOptions: {
        lines: [
          { textBlocks: [{ text: "test1", type: "text", style: "green" }] },
          { textBlocks: [{ text: "test2", type: "text", style: "blue" }] },
          { textBlocks: [{ text: "test3", type: "text" }] },
        ],
        contentProps: { allowNewLine: true, styles: mockContentProps.styles },
      },
    });
    expect(screen.queryByText("Each line must have only one style")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Each line must have at least one character"),
    ).not.toBeInTheDocument();
  });

  test("Missing available option", async () => {
    const mockSet = jest.fn();
    jest.spyOn(ed, "EditorV3").mockImplementation((props: ed.EditorV3Props) => {
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
                {
                  textBlocks: [
                    { type: "text", text: "test3" },
                    { text: " shiny", style: "pink" },
                  ],
                },
              ],
            })
          }
        />
      );
    });
    await act(async () =>
      render(
        <WindowViewContext.Provider value={{ ...mockContext, dispatch: mockSet }}>
          <WindowViewSelectOptions
            lineIndex={0}
            blockIndex={0}
          />
        </WindowViewContext.Provider>,
      ),
    );
    const availableOptionsInput = screen.queryByLabelText(
      "Available options",
    ) as HTMLTextAreaElement;
    expect(availableOptionsInput).toBeInTheDocument();
    await act(async () => fireEvent.blur(availableOptionsInput));
    expect(screen.queryByText("Each line must have only one style")).toBeInTheDocument();
    expect(screen.queryByText("Each line must have at least one character")).toBeInTheDocument();
  });
});
