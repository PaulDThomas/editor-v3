import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemInput } from "./ItemInput";
import { ObjectEditorContextProvider, ObjectEditorItemOptions } from "./ObjectEditorContext";

describe("ItemInput tests", () => {
  const mockObject = {
    green: {
      color: "green",
      fontSize: "18pt",
      fontWeight: 1000,
      isLocked: true,
    },
    blue: { color: "blue", fontWeight: 700 },
    red: { color: "red", isNotAvailable: true, fontSize: "LARGE" },
  };
  const mockObjectTemplate: ObjectEditorItemOptions[] = [
    { name: "color", type: "string" },
    {
      name: "fontSize",
      type: "select",
      options: [
        { value: undefined, label: "None" },
        { value: "8pt", label: "8pt" },
        { value: "9pt", label: "9pt" },
        { value: "10pt", label: "10pt" },
        { value: "11pt", label: "11pt" },
        { value: "12pt", label: "12pt" },
        { value: "14pt", label: "14pt" },
        { value: "16pt", label: "16pt" },
        { value: "18pt", label: "18pt" },
      ],
    },
    { name: "fontWeight", type: "number" },
    { name: "isLocked", type: "boolean" },
  ];
  const user = userEvent.setup();

  test("Blank render", () => {
    render(
      <ItemInput
        data-testid="item"
        dataPoint="green.color"
      />,
    );
    const item = screen.queryByTestId("item");
    expect(item).not.toBeInTheDocument();
  });

  test("Render unticked checkbox", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="red.isLocked"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLInputElement);
    await user.click(item);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      red: { ...mockObject.red, isLocked: true },
    });
  });

  test("Render ticked checkbox", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="green.isLocked"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLInputElement);
    expect(item).toBeChecked();
    await user.click(item);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      green: { ...mockObject.green, isLocked: false },
    });
  });

  test("Render select", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="blue.fontSize"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLSelectElement);
    expect(item).toHaveValue("0-None");
    await user.selectOptions(item, "16pt");
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      blue: { ...mockObject.blue, fontSize: "16pt" },
    });
  });

  test("Render select with strange value", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="red.fontSize"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLSelectElement);
    expect(item).toHaveValue("LARGE");
    expect(item.querySelector("option:checked")).toBeDisabled();
    await user.selectOptions(item, "None");
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      red: { ...mockObject.red, fontSize: undefined },
    });
  });

  test("Render text input", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="green.color"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLInputElement);
    expect(item).toHaveValue("green");
    fireEvent.change(item, { target: { value: "blue" } });
    fireEvent.blur(item);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      green: { ...mockObject.green, color: "blue" },
    });
  });

  test("Render number input", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <ItemInput
          data-testid="item"
          dataPoint="blue.fontWeight"
        />
      </ObjectEditorContextProvider>,
    );
    const item = screen.getByTestId("item");
    expect(item).toBeInTheDocument();
    expect(item).toBeInstanceOf(HTMLInputElement);
    expect(item).toHaveValue(700);
    fireEvent.change(item, { target: { value: "900" } });
    fireEvent.blur(item);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      ...mockObject,
      blue: { ...mockObject.blue, fontWeight: 900 },
    });
  });
});
