import { cloneDeep } from "lodash";
import { IEditorV3 } from "../classes/interface";

export const splitV3intoLines = (value: IEditorV3): IEditorV3[] => {
  return value.lines.map((line) => ({
    lines: [cloneDeep(line)],
    contentProps: value.contentProps,
  }));
};
