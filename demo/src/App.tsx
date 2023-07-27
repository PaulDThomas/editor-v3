import { useState } from 'react';
import { EditorV3, EditorV3Align, EditorV3Styles } from '../../src/main';

export const App = (): JSX.Element => {
  const [input, setHtml] = useState<string>(
    JSON.stringify({
      textAlign: 'left',
      lines: [{ text: '12.34', style: 'green' }, { text: '0' }, { text: '56.78', style: 'blue' }],
      styles: {
        blue: { color: 'blue', fontWeight: 700 },
      },
    }),
  );
  const [input2, setInput2] = useState<string>('Another one');
  const [input3, setInput3] = useState<string>(
    `<div classname="aie-text" data-key="2usqj" data-type="unstyled" data-inline-style-ranges="[]">Scatter plot of eGFR values post randomization, with LOESS smoothing line overlayed.</div><div classname="aie-text" data-key="8uaa4" data-type="unstyled" data-inline-style-ranges="[]"></div><div classname="aie-text" data-key="5mj3a" data-type="unstyled" data-inline-style-ranges="[]">Y-axis label: eGFR (ml/min/1.73^2)</div><div classname="aie-text" data-key="ebhpo" data-type="unstyled" data-inline-style-ranges="[]">X-axis label: Time since randomization (months)</div><div classname="aie-text" data-key="fafoq" data-type="unstyled" data-inline-style-ranges="[]"></div><div classname="aie-text" data-key="bs8eq" data-type="unstyled" data-inline-style-ranges="[]">Separate plots for SZC and Placebo arm; LOESS line should have 95% Confidence interval included too.</div><div classname="aie-text" data-key="14o5e" data-type="unstyled" data-inline-style-ranges="[]"></div>`,
  );
  const [json, setJson] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [align, setAlign] = useState<EditorV3Align>(EditorV3Align.decimal);
  const [editable, setEditable] = useState<boolean>(true);
  const [allowNewLine, setAllowNewLine] = useState<boolean>(true);
  const [decPct, setDecPct] = useState<number>(60);
  const styleMap: EditorV3Styles = {
    green: {
      color: 'green',
      backgroundColor: 'white',
      fontFamily: 'Courier New',
      fontSize: '1.3rem',
      fontWeight: 1000,
    },
    blue: { color: 'blue', fontWeight: 700 },
  };

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
                customStyleMap={styleMap}
                style={{
                  width: '240px',
                }}
                spellCheck={false}
              />
            </span>
          </div>

          <div className='row'>
            <span className='label'>Test config</span>
            <span className='content'>
              <EditorV3
                id='test-editor'
                resize
                input={JSON.stringify({
                  lines: [
                    {
                      textBlocks: [{ text: '34.56' }],
                      textAlignment: 'center',
                      decimalAlignPercent: 80,
                    },
                    {
                      textBlocks: [{ text: 'x.xx', style: 'shiny' }],
                      textAlignment: 'center',
                      decimalAlignPercent: 80,
                    },
                  ],
                  styles: { shiny: { color: 'pink', backgroundColor: 'yellow', fontWeight: 700 } },
                  textAlignment: EditorV3Align.center,
                  decimalAlignPercent: 80,
                })}
              />
            </span>
          </div>

          <div className='row'>
            <span className='label'>JSON input</span>
            <span className='content'>
              <EditorV3
                id={'e2'}
                input={input2}
                setJson={setInput2}
                textAlignment={align}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={styleMap}
                style={{
                  width: '240px',
                  minHeight: '60px',
                }}
              />
            </span>
          </div>

          <div className='row'>
            <span className='label'>Text input (spelling)</span>
            <span className='content'>
              <EditorV3
                id={'e3'}
                input={input3}
                setText={setInput3}
                textAlignment={EditorV3Align.left}
                decimalAlignPercent={decPct}
                allowNewLine={allowNewLine}
                editable={editable}
                customStyleMap={styleMap}
                spellCheck={true}
                style={{
                  width: '600px',
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
