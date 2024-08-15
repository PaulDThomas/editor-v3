import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewBlockType } from "./WindowViewBlockType";

describe("WindowViewBlockType", () => {
  const user = userEvent.setup();

  test("Basic render & select", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewBlockType
        includeAt={true}
        type="at"
        disabled={false}
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
