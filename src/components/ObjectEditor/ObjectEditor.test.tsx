import { screen, render } from "@testing-library/react";
import { ObjectEditor } from "./ObjectEditor";
import { ObjectEditorItemOptions } from "./ObjectEditorContext";

describe("Object Editor tests", () => {
  const mockObject = {
    Green: {
      color: "green",
      fontSize: "18pt",
      fontWeight: 1000,
      isLocked: true,
    },
    Blue: { color: "blue", fontWeight: 700 },
    Red: { color: "red", isNotAvailabe: true, fontSize: "LARGE" },
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

  test("Basic render", async () => {
    const mockSet = jest.fn();
    render(
      <ObjectEditor
        object={mockObject}
        setObject={mockSet}
        objectTemplate={mockObjectTemplate}
      />,
    );
    expect(screen.queryByDisplayValue("Green")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Blue")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Red")).toBeInTheDocument();
  });
});
