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
import { EditorV3, EditorV3Align, EditorV3Styles } from '@asup/editor-v3';

... inside REACT component

<EditorV3
  id: string;
  input: string;
  editable?: boolean;
  setHtml?: (ret: string) => void;
  setText?: (ret: string) => void;
  setJson?: (ret: string) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
  resize?: boolean;
/>
```

## Properties

| Prop                | Description                                                                                                                                      |                      |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| id                  | HTML component id                                                                                                                                |                      |
| input               | Input string, can from plain text, JSON or HTML fragment                                                                                         |                      |
| editable            | If the value can be edited                                                                                                                       | `true`               |
| setHtml             | Function that receives the HTML fragment from the control                                                                                        |                      |
| setText             | Function that receives the plain text in the control. Lines are separated by `\n`                                                                |                      |
| setJson             | Function that received the JSON in the control                                                                                                   |                      |
| customStyleMap      | Map for CSS styles that can be used for formatting in the control                                                                                |                      |
| allowNewLine        | If the control is allowed to have more than one line                                                                                             | `false`              |
| textAligment        | Alignment for the text inside the control                                                                                                        | `EditorV3Align.left` |
| decimalAlignPercent | Percentage of the control width from the left hand side that the first decimal point will be placed when textAlignment = `EditorV3Align.decimal` | `60`                 |
| style               | CSS styles to apply to the outer control element                                                                                                 |                      |
| resize              | Indicates whether the control can be resized or not                                                                                              | `false`              |

# Returns

The control can return any of or all of the following output types, and will accept any as an input.

## Text

For when only the text matters, will operate as a normal control, returning text when the control is blurred.

## HTML

For when formatting matters - an HTML fragment will be returned as a string

## JSON

For when maching readability matters - an stringified JSON object will be returned with structure below

### JSON Structure

```
{
  lines: {
    textBlocks: {
      text: string,
      style?: string,
    }[],
    textAlignment: "left" | "center" | "decimal" | "right",
    decimalAlignPercent: number
  }[],
  textAlignment: EditorV3Align,
  decimalAlignPercent: number,
  styles: {
    [styleName: string]: React.CSSProperties;
  },
}
```

The values for textAlignment & decimalAlignPercent will always be the same for all entries in the object, but are copied for convenience
The value of style in any given text block, should match one of the keys in the style object, the CSS styles from the object will then be applied to the text block.

Styles pasted between different controls will be kept, other objects pasted into the control will be pasted as plain text.
