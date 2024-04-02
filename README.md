[npm]: https://img.shields.io/npm/v/@asup/editor-v3
[npm-url]: https://www.npmjs.com/package/@asup/editor-v3
[size]: https://packagephobia.now.sh/badge?p=@asup/editor-v3
[size-url]: https://packagephobia.now.sh/result?p=@asup/editor-v3

[![npm][npm]][npm-url]
[![size][size]][size-url]
![npm bundle size](https://img.shields.io/bundlephobia/min/@asup/editor-v3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/PaulDThomas/editor-v3/master/LICENCE)

# @asup/editor-v3

REACT Typescript Editor component, because I couldn't quite find what I wanted.

## Installation

```
# with npm
npm install @asup/editor-v3
```

## Usage

Context menu provider, takes a list of available actions and renders a context menu on appropriate click.
Wrap around the elements that need to have the menu

```
import { EditorV3, EditorV3Align, EditorV3Styles, IEditorV3, EditorV3AtListItem } from '@asup/editor-v3';

... inside REACT component

<EditorV3
  id: string;
  input: string | IEditorV3;
  editable?: boolean;
  setText?: (ret: string) => void;
  setObject?: (ret: IEditorV3) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
  resize?: boolean;
  spellCheck?: boolean;
  styleOnContextMenu?: boolean;
  allowMarkdown?: boolean;
  markdownSettings?: IMarkdownSettings;
  debounceMilliseconds?: number | null;
  atListFunction?: (at: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>;
  ...rest (of HTMLDivElement)
/>
```

## Properties

| Prop                 | Description                                                                                                                                                                           |                      |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| id                   | HTML component id                                                                                                                                                                     |                      |
| input                | Input string, can from plain text, JSON or HTML fragment                                                                                                                              |                      |
| editable             | If the value can be edited                                                                                                                                                            | `true`               |
| setText              | Function that receives the plain text in the control. Lines are separated by `\n`                                                                                                     |                      |
| setObject            | Function that receives the current `IEditorV3` object                                                                                                                                 |                      |
| customStyleMap       | Map for CSS styles that can be used for formatting in the control                                                                                                                     |                      |
| allowNewLine         | If the control is allowed to have more than one line                                                                                                                                  | `false`              |
| textAligment         | Alignment for the text inside the control                                                                                                                                             | `EditorV3Align.left` |
| decimalAlignPercent  | Percentage of the control width from the left hand side that the first decimal point will be placed when textAlignment = `EditorV3Align.decimal`                                      | `60`                 |
| style                | CSS styles to apply to the outer control element                                                                                                                                      |                      |
| resize               | Indicates whether the control can be resized or not                                                                                                                                   | `false`              |
| spellCheck           | Indicates whether the control allows the browser spell check to run                                                                                                                   | `false`              |
| styleOnContextMenu   | Indicates if the available styles are shown on the context menu                                                                                                                       | `true`               |
| markdownSettings     | Characters to use in markdown                                                                                                                                                         | as below             |
| debounceMilliSeconds | Number of milliseconds to wait before sending the response back via one of the setTTTT functions. If this is set to `null` the return will only be made when the component is blurred | `null`               |
| atListFunction       | Function that will be called to return a list of available @matched items                                                                                                             |                      |

# Returns

The control can return any of or all of the following output types, and will accept any as an input.

## Text

For when only the text matters, will operate as a normal control, returning text when the control is blurred.

## Object

Object return

### IEditorV3

```
{
  lines: [{
    textBlocks: [{
      text: string,
      style?: string,
      type?: "text" | "at",
      isLocked?: true | undefined,
      lineStartPosition?: number,
      atData?: Record<string, string>,
      maxAtListLength?: number,
    }],
    contentProps?: EditorV3ContentPropsInput
  }];
  contentProps?: EditorV3ContentPropsInput,
}
```

The values for contentProps will always be the same for all entries in the object, but are copied for convenience

### AtListFunction

Assigning a function to this parameter will enable collaberative @mentions.

### EditorV3ContentPropsInput

This is mainly for internal use, and will be over ridden by any settings in the editor, however given here for completeness

```
{
  allowMarkdown?: boolean,
  allowNewLine?: boolean,
  decimalAlignPercent?: number,
  markdownSettings?: IMarkdownSettings,
  showMarkdown?: boolean,
  styles?: EditorV3Styles,
  textAlignment?: EditorV3Align,
  atListFunction?: (typedString: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>,
}
```

The value of style in any given text block, should match one of the keys in the style object, the CSS styles from the object will then be applied to the text block.

```
EditorV3Style extends React.CSSProperties {
  isLocked?: boolean;
}
EditorV3Styles {
  [styleName: string]: EditorV3Style;
}
```

isLocked has been added as a style property, to allow blocks to be non-editable. They still can be deleted in their entirety. This is used for @mention blocks.

## Editor utility

### Cut and paste

Styles pasted between different controls will be kept, other objects pasted into the control will be pasted as plain text.
