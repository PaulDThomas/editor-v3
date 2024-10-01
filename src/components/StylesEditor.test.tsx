import { screen, render, fireEvent } from "@testing-library/react";
import { StylesEditor } from "./StylesEditor";

describe("Styles Editor tests", () => {
  const styles = {
    Green: {
      color: "green",
      fontSize: "18pt",
      fontWeight: 1000,
      isLocked: true,
    },
    Blue: { color: "blue", fontWeight: 700 },
    Red: { color: "red", isNotAvailable: true, fontSize: "LARGE" },
  };

  test("Basic render", async () => {
    const mockSet = jest.fn();
    render(
      <StylesEditor
        styles={styles}
        setStyles={mockSet}
      />,
    );
    expect(screen.queryByDisplayValue("Blue")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Red")).toBeInTheDocument();

    const input = screen.queryByDisplayValue("Green") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Yellow" } });
    fireEvent.blur(input);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      Yellow: styles.Green,
      Blue: styles.Blue,
      Red: styles.Red,
    });
  });
});
