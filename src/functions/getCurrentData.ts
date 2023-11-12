import { EditorV3Content } from "../classes/EditorV3Content";

export function getCurrentData(
  divRef: React.MutableRefObject<HTMLDivElement | null>,
  // styleName: string,
  // style: React.CSSProperties,
): { html: string; text: string; json: string } {
  const currentContent = new EditorV3Content(divRef.current?.innerHTML ?? "");
  return {
    html: divRef.current?.innerHTML ?? "",
    text: currentContent.text,
    json: currentContent.jsonString,
  };
}
