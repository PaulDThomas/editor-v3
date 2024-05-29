import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";

describe("WindowViewBlockStyle", () => {
  const user = userEvent.setup();

  test("Basic render & select", async () => {
    const mockSet = jest.fn();
    const styles = {
      Green: { isNotAvailabe: false, color: "green" },
      Blue: { isNotAvailabe: true, color: "blue" },
    };
    render(
      <WindowViewBlockStyle
        styles={styles}
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
