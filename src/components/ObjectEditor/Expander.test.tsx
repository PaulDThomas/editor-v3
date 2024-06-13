import { fireEvent, render, screen } from "@testing-library/react";
import { Expander } from "./Expander";
import { act } from "react";
import userEvent from "@testing-library/user-event";

describe("Expander", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Renders lineChild and children when open", () => {
    render(
      <Expander
        open={true}
        lineChild={<div>Line Child</div>}
      >
        <div>Children</div>
      </Expander>,
    );

    const lineChild = screen.queryByText("Line Child");
    const children = screen.queryByText("Children");

    expect(lineChild).toBeInTheDocument();
    expect(children).toBeInTheDocument();
  });

  test("Does not render children when closed", () => {
    render(
      <Expander
        open={false}
        lineChild={<div>Line Child</div>}
      >
        <div>Children</div>
      </Expander>,
    );

    const lineChild = screen.queryByText("Line Child");
    const children = screen.queryByText("Children");

    expect(lineChild).toBeInTheDocument();
    expect(children).not.toBeInTheDocument();
  });

  test("Does not change when disabled", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(
      <Expander
        open={false}
        disabled
        lineChild={<div>Line Child</div>}
      >
        <div>Children</div>
      </Expander>,
    );
    const expander = container.querySelector(".expander") as HTMLDivElement;
    const holder = container.querySelector(".holder") as HTMLDivElement;
    const lineChild = screen.queryByText("Line Child");

    expect(holder).toBeInTheDocument();
    expect(lineChild).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();

    // Open
    await act(async () => {
      await user.click(holder);
      jest.runAllTimers();
    });

    expect(expander).not.toHaveClass("placing");
    expect(expander).toHaveClass("closed");
    expect(lineChild).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });

  test("Toggles between open and closed when clicked", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(
      <Expander
        open={false}
        lineChild={<div>Line Child</div>}
      >
        <div>Children</div>
      </Expander>,
    );
    const expander = container.querySelector(".expander") as HTMLDivElement;
    const holder = container.querySelector(".holder") as HTMLDivElement;
    const lineChild = screen.queryByText("Line Child");

    expect(holder).toBeInTheDocument();
    expect(lineChild).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();

    // Open
    await act(async () => {
      await user.click(holder);
      jest.runAllTimers();
    });

    expect(expander).toHaveClass("placing");
    await act(async () => jest.runAllTimers());
    expect(expander).toHaveClass("opening");
    await act(async () => jest.runAllTimers());
    jest.runAllTimers();
    expect(expander).toHaveClass("open");
    expect(lineChild).toBeInTheDocument();
    expect(screen.queryByText("Children")).toBeInTheDocument();

    // Close
    await act(async () => {
      fireEvent.click(holder);
      jest.runAllTimers();
    });

    expect(expander).toHaveClass("closing");
    await act(async () => jest.runAllTimers());
    expect(expander).toHaveClass("closed");
    expect(lineChild).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });
});
