import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../classes";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";

describe("WindowViewBlockStyle", () => {
  const user = userEvent.setup();

  test("No render without styles", async () => {
    const mockSet = jest.fn;
    const content = new EditorV3Content("test");
    render(
      <WindowViewBlockStyle
        data-testid="test-select"
        state={{
          content,
          focus: false,
        }}
        setStyleName={mockSet}
      />,
    );
    const select = screen.queryByTestId("test-select") as HTMLSelectElement;
    expect(select).not.toBeInTheDocument();
  });

  test("Basic render & select", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content("test", {
      styles: {
        Green: { isNotAvailabe: false, color: "green" },
        Blue: { isNotAvailabe: true, color: "blue" },
      },
    });
    render(
      <WindowViewBlockStyle
        state={{
          content,
          focus: false,
        }}
        styleName={"Blue"}
        setStyleName={mockSet}
      />,
    );
    expect(screen.queryByText("Style")).toBeInTheDocument();
    const select = screen.queryByLabelText("Style") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue(["Blue"]);
    expect(select.querySelector("option[value='Blue']")).toBeDisabled();
    await user.selectOptions(select, "Green");
    expect(mockSet).toHaveBeenCalledWith("Green");
  });
});
