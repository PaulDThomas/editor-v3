import { useState } from 'react';
import { EditorV3 } from '../../src/components/EditorV3';
import { EditorV3Align } from '../../src/functions/interface';

export const App = (): JSX.Element => {
  const [text, setText] = useState<string>('12.34');
  const [align, setAlign] = useState<EditorV3Align>(EditorV3Align.left);
  const [decPct, setDecPct] = useState<number>(60);

  return (
    <div className='app-holder'>
      <div className='app-border'>
        <div className='app-inner'>
          <div className='row'>
            <span className='label'>This is the input</span>
            <span className='content'>
              <EditorV3
                id={'e1'}
                text={text}
                setText={setText}
                textAlignment={align}
                decimalAlignPercent={decPct}
                style={{
                  width: '240px',
                }}
              />
            </span>
          </div>
          <div className='row'>
            <span className='label'>Alignment</span>
            <span className='content'>
              <select
                value={align}
                onChange={(e) => {
                  const v: EditorV3Align = e.currentTarget.value as EditorV3Align;
                  setAlign(v);
                }}
              >
                {Object.keys(EditorV3Align).map((k) => (
                  <option
                    key={k}
                    value={k as EditorV3Align}
                  >
                    {k}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className='row'>
            <span className='label'>Decimal percent</span>
            <span className='content'>
              <input
                type={'number'}
                value={decPct}
                onChange={(e) => {
                  setDecPct(parseInt(e.currentTarget.value));
                }}
              />
            </span>
          </div>
          <div className='row'>
            <span className='label'>Text</span>
            <span className='content'>{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
