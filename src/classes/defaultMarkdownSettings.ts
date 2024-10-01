export interface IMarkdownSettings {
  styleStartTag: string;
  styleNameEndTag: string;
  styleEndTag: string;
  defaultStyle: string;
  dropDownStartTag: string;
  dropDownEndTag: string;
  dropDownValueSeparator: string;
  dropDownSelectedValueTag: string;
  calcStartTag: string;
  calcNameEndTag: string;
  calcEndTag: string;
  calcConditionSeparator: string;
  calcAndSeparator: string;
  atStartTag: string;
  atEndTag: string;
}

export const defaultMarkdownSettings = {
  defaultStyle: "defaultStyle",
  styleStartTag: "(~(",
  styleNameEndTag: "::",
  styleEndTag: ")~)",
  dropDownStartTag: "(¬(",
  dropDownEndTag: ")¬)",
  dropDownValueSeparator: "||",
  dropDownSelectedValueTag: "**",
  calcStartTag: "[![",
  calcNameEndTag: "::",
  calcEndTag: "]!]",
  calcConditionSeparator: "||",
  calcAndSeparator: "&&",
  atStartTag: "@[",
  atEndTag: "@]",
};
