import { fireEvent, render, screen } from "@testing-library/react";
import { InternalObjectEditor } from "./InternalObjectEditor";
import { ObjectEditorContextProvider, ObjectEditorItemOptions } from "./ObjectEditorContext";

describe("InternalObjectEditor tests", () => {
  const mockObject = {
    green: {
      color: "green",
      fontSize: "18pt",
      fontWeight: 1000,
      isLocked: true,
    },
    lightGreen: {
      color: "lightGreen",
      fontSize: "12pt",
      fontWeight: 800,
      isLocked: false,
    },
    darkGreen: {
      color: "darkGreen",
      fontSize: "14pt",
      fontWeight: 900,
      isLocked: true,
    },
    seaGreen: {
      color: "seaGreen",
      fontSize: "16pt",
      fontWeight: 950,
      isLocked: false,
    },
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

  test("Blank render", () => {
    render(<InternalObjectEditor dataPath="blue" />);
    expect(screen.getByText("blue not found")).toBeInTheDocument();
  });

  test("Root render and change", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      >
        <InternalObjectEditor dataPath="green" />
      </ObjectEditorContextProvider>,
    );
    expect(screen.queryByText("Name")).toBeInTheDocument();
    const nameInput = screen.queryByLabelText("Name") as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue("green");
    fireEvent.change(nameInput, { target: { value: "blue" } });
    expect(mockSet).not.toHaveBeenCalled();
    fireEvent.blur(nameInput);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({
      blue: mockObject.green,
      lightGreen: mockObject.lightGreen,
      darkGreen: mockObject.darkGreen,
      seaGreen: mockObject.seaGreen,
    });
  });

  test("Show expander", async () => {
    render(
      <ObjectEditorContextProvider
        object={mockObject}
        setObject={() => {}}
        objectTemplate={mockObjectTemplate}
      >
        <InternalObjectEditor
          dataPath="green"
          data-testid="test"
        />
      </ObjectEditorContextProvider>,
    );
    const expander = screen.getByTestId("test");
    expect(expander).toHaveClass("expander");
    const holder = expander.querySelector(".holder") as HTMLDivElement;
    fireEvent.click(holder);
    expect(expander).toHaveClass("expanded");
  });
});
