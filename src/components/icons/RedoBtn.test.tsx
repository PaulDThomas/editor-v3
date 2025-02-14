import { screen, render, fireEvent } from "@testing-library/react";
import { RedoBtn } from "./RedoBtn";

describe("RedoBtn", () => {
  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(
      <RedoBtn
        onClick={handleClick}
        fill="black"
      />,
    );

    fireEvent.click(screen.getByLabelText("Redo"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
