import { useEffect, useId, useState } from "react";
import { WindowViewSelectOptionsProps } from "../WindowViewSelectOptions";

export const WindowViewSelectOptions = ({
  type,
  options,
  setOptions,
}: WindowViewSelectOptionsProps): React.ReactNode => {
  const selectOptionsId = useId();

  // Holder for available options
  const [input, setInput] = useState<string>(
    options.availableOptions?.map((o) => o.data?.text ?? "").join("\n") ?? "",
  );
  useEffect(() => {
    setInput(options.availableOptions?.map((o) => o.data?.text ?? "").join("\n") ?? "");
  }, [options.availableOptions]);

  return type !== "select" ? null : (
    <>
      <label htmlFor={`available-${selectOptionsId}`}>Available options</label>
      <textarea
        id={`available-${selectOptionsId}`}
        data-testid={`available-${selectOptionsId}`}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onBlur={() => {
          setOptions({
            ...options,
            availableOptions: input
              .split("\n")
              .map((o) => ({ text: o, data: { noStyle: "true" } })),
          });
        }}
      />
    </>
  );
};
