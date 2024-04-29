import { ContextWindowStack } from "@asup/context-menu";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes";
import { WindowView } from "./WindowView";

describe("WindowView", () => {
  const user = userEvent.setup();

  test("Hidden window", async () => {
    const mockSetContent = jest.fn();
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
        setContent={mockSetContent}
      />,
    );
    expect(screen.queryByText("Editor contents")).not.toBeInTheDocument();
  });

  test("Basic render, and check buttons", async () => {
    const mockSetContent = jest.fn();
    const mockUndo = jest.fn();
    const mockRedo = jest.fn();
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
          setContent={mockSetContent}
          undo={mockUndo}
          redo={mockRedo}
        />
      </ContextWindowStack>,
    );
    expect(screen.queryByText("Editor contents")).toBeInTheDocument();
    expect(screen.queryByLabelText("Undo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Redo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Close window")).toBeInTheDocument();

    await user.click(screen.queryByLabelText("Close window") as Element);
    expect(mockSetShow).toHaveBeenCalledWith(false);

    await user.click(screen.queryByLabelText("Undo") as Element);
    expect(mockUndo).toHaveBeenCalled();

    await user.click(screen.queryByLabelText("Redo") as Element);
    expect(mockRedo).toHaveBeenCalled();
  });

  test("Update line", async () => {
    const mockSetContent = jest.fn();
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
          setContent={mockSetContent}
        />
      </ContextWindowStack>,
    );
    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    await user.type(textInput, " - Summerville's overhead kick hits the back of the net!!! ⚽ ");
    fireEvent.blur(textInput);
    expect(mockSetContent).toHaveBeenCalled();
  });
});
