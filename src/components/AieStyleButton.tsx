import * as React from 'react';
import './EditorV3';

interface AieStyleButtonProps {
  id: string;
  styleName: string;
  currentStyle: boolean;
  applyStyleFunction: (styleName: string) => void;
  disabled?: boolean;
}

export const AieStyleButton = (props: AieStyleButtonProps): JSX.Element => {
  // Apply style on click
  const aieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    props.applyStyleFunction(props.styleName);
  };
  const className =
    'aie-button' +
    (typeof props.currentStyle === 'boolean' && props.currentStyle === true ? ' active' : '');
  return (
    <button
      id={props.id}
      className={className}
      onMouseDown={aieClick}
      disabled={props.disabled}
    >
      {props.styleName}
    </button>
  );
};
