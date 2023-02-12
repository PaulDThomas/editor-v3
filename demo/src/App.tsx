import { useState } from 'react';
import { EditorV3Align } from '../../src/classes/interface';
import { EditorV3 } from '../../src/components/EditorV3';

export const App = (): JSX.Element => {
  const [input, setHtml] = useState<string>(
    // '<div classname="aie-text" data-inline-style-ranges=\'[{"length":9,"offset":0,"style":""}]\'><div class="aiev3-decimal-line" style="height: 21px;"><span class="aiev3-span aiev3-span-point" style="text-align: right; right: 40%;"><span>d12</span></span><span class="aiev3-span aiev3-span-point" style="text-align: left; left: 60%;"><span>.34d</span></span></div></div>',
    '12.3\n\n4\n\n43\n.45\nhello',
    // 'what\ndo\nyou\n\nwant?',
  );
  const [input2, setJson2] = useState<string>('Another one');
  const [input3, setText3] = useState<string>('And another one');
  const [json, setJson] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [align, setAlign] = useState<EditorV3Align>(EditorV3Align.decimal);
  const [editable, setEditable] = useState<boolean>(true);
  const [allowNewLine, setAllowNewLine] = useState<boolean>(true);
  const [decPct, setDecPct] = useState<number>(60);

  return (
    <div className='app-holder'>
      <div className='app-border'>
        <div className='app-inner'>
          <div className='row'>
            <span className='label'>This is the input</span>
            <span className='content debug'>
              <EditorV3
                id={'e1'}
                input={input}
                setHtml={setHtml}
                setText={setText}
                setJson={setJson}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                style={{
                  width: '240px',
                }}
              />
            </span>
          </div>
          <div className='row'>
            <span className='label'>JSON input</span>
            <span className='content'>
              <EditorV3
                id={'e2'}
                input={input2}
                setJson={setJson2}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                style={{
                  width: '240px',
                }}
              />
            </span>
          </div>
          <div className='row'>
            <span className='label'>Text input</span>
            <span className='content'>
              <EditorV3
                id={'e3'}
                input={input3}
                setText={setText3}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                style={{
                  width: '240px',
                }}
              />
            </span>
          </div>

          <hr />

          <div className='row'>
            <span className='label'>Allow new line</span>
            <span className='content'>
              <select
                value={allowNewLine ? 'true' : 'false'}
                onChange={(e) => {
                  setAllowNewLine(e.currentTarget.value === 'true');
                }}
              >
                <option value={'true'}>true</option>
                <option value={'false'}>false</option>
              </select>
            </span>
          </div>

          <div className='row'>
            <span className='label'>Editable</span>
            <span className='content'>
              <select
                value={editable ? 'true' : 'false'}
                onChange={(e) => {
                  setEditable(e.currentTarget.value === 'true');
                }}
              >
                <option value={'true'}>true</option>
                <option value={'false'}>false</option>
              </select>
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
                  setDecPct(e.currentTarget.value ? parseInt(e.currentTarget.value) : 0);
                }}
              />
            </span>
          </div>

          <div className='row'>
            <span className='label'>Text</span>
            <span className='content'>{text.replace(/\n/g, '\\n')}</span>
          </div>
          <div className='row'>
            <span className='label'>JSON</span>
            <span className='content'>
              <pre>{json === '' ? '' : JSON.stringify(JSON.parse(json), null, 2)}</pre>
            </span>
          </div>
          <div className='row'>
            <span className='label'>HTML</span>
            <span className='content'>
              <pre>{input.replace(/></g, '>\u200b<').split('\u200b').join('\n')}</pre>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
