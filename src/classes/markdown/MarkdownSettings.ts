export interface IMarkdownSettings {
  styleStartTag: string;
  styleNameEndTag: string;
  styleEndTag: string;
  defaultStyle: string;
  dropDownStartTag: string;
  dropDownNameEndTag: string;
  dropDownEndTag: string;
  dropDownValueSeparator: string;
  dropDownSelectedValueTag: string;
  calcStartTag: string;
  calcNameEndTag: string;
  calcEndTag: string;
  calcConditionSeparator: string;
  calcAndSeparator: string;
}

export const defaultMarkdownSettings = {
  styleStartTag: "<<",
  styleNameEndTag: "::",
  styleEndTag: ">>",
  defaultStyle: "defaultStyle",
  dropDownStartTag: "[[",
  dropDownNameEndTag: "::",
  dropDownEndTag: "]]",
  dropDownValueSeparator: "||",
  dropDownSelectedValueTag: "**",
  calcStartTag: "[![",
  calcNameEndTag: "::",
  calcEndTag: "]!]",
  calcConditionSeparator: "||",
  calcAndSeparator: "&&",
};
