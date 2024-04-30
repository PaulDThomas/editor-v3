import { ContextWindowStack } from "@asup/context-menu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes";
import { WindowView } from "./WindowView";

describe("WindowView", () => {
  const user = userEvent.setup();

  test("Hidden window", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    render(
      <WindowView
        id="test-window"
        showWindowView={false}
        setShowWindowView={mockSetShow}
        state={{
          content: new EditorV3Content("test"),
          focus: false,
        }}
        setState={mockSetState}
      />,
    );
    expect(screen.queryByText("Editor contents")).not.toBeInTheDocument();
  });

  test("Basic render, and check buttons", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    expect(screen.queryByText("Editor contents")).toBeInTheDocument();
    expect(screen.queryByLabelText("Undo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Redo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Close window")).toBeInTheDocument();

    await user.click(screen.queryByLabelText("Close window") as Element);
    expect(mockSetShow).toHaveBeenCalledWith(false);
  });

  test("Update line", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    await user.type(textInput, " - Summerville's overhead kick hits the back of the net!!! ⚽ ");
    expect(mockSetState).not.toHaveBeenCalled();
    await user.click(screen.queryByLabelText("Close window") as Element);
    expect(mockSetState).toHaveBeenCalled();
  });
});
