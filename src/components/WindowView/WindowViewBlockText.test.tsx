import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewBlockText } from "./WindowViewBlockText";

describe("WindowViewBlockStyle", () => {
  const user = userEvent.setup();

  test("Disabled render", async () => {
    const mockSet = jest.fn;
    render(
      <WindowViewBlockText
        data-testid="test-input"
        label="Mock label"
        text="Hello"
        disabled={true}
        setText={mockSet}
      />,
    );
    const input = screen.queryByTestId("test-input") as HTMLSelectElement;
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(screen.queryByText("Mock label")).toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlockText
        data-testid="test-select"
        label="Mock label"
        disabled={false}
        setText={mockSet}
      />,
    );
    const input = screen.queryByLabelText("Mock label") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue([""]);
    await user.type(input, "Hello");
    expect(mockSet).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(mockSet).toHaveBeenCalledWith("Hello");
  });
});
