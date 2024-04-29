import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes";
import { WindowViewBlockType } from "./WindowViewBlockType";

describe("WindowViewBlockType", () => {
  const user = userEvent.setup();

  test("No render without atListFunction", async () => {
    const mockSet = jest.fn;
    const content = new EditorV3Content("test");
    render(
      <WindowViewBlockType
        data-testid="test-select"
        state={{
          content,
          focus: false,
        }}
        type="at"
        setType={mockSet}
      />,
    );
    const select = screen.queryByTestId("test-select") as HTMLSelectElement;
    expect(select).not.toBeInTheDocument();
  });

  test("Basic render & select", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content("test", { atListFunction: jest.fn() });
    render(
      <WindowViewBlockType
        state={{
          content,
          focus: false,
        }}
        type="at"
        setType={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).toBeInTheDocument();
    const select = screen.queryByLabelText("Type") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue("At");
    expect(select.querySelector("option[value='at']")).toBeDisabled();
    await user.selectOptions(select, "text");
    expect(mockSet).toHaveBeenCalledWith("text");
  });
});
