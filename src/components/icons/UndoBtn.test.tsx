import { screen, render, fireEvent } from "@testing-library/react";
import { UndoBtn } from "./UndoBtn";

describe("UndoBtn", () => {
  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(
      <UndoBtn
        onClick={handleClick}
        fill="black"
      />,
    );

    fireEvent.click(screen.getByLabelText("Undo"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
