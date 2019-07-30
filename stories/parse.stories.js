/* eslint no-console:0 */

import React from 'react';
import XTemplate from '../packages/xtemplate';
import { storiesOf } from '@storybook/react';

class Test extends React.Component {
  constructor() {
    super();
    this.parse = this.parse.bind(this);
  }

  parse() {
    const g = XTemplate.Compiler.parse(this.refs.tpl.value);
    console.log(g);
  }

  render() {
    return (
      <div>
        <link
          rel="stylesheet"
          href="//g.tbcdn.cn/kissy/k/1.4.2/css/dpl/base.css"
        />
        <link
          rel="stylesheet"
          href="//g.tbcdn.cn/kissy/k/1.4.2/css/dpl/forms.css"
        />
        <link
          rel="stylesheet"
          href="//g.tbcdn.cn/kissy/k/1.4.2/button/assets/dpl.css"
        />
        <div className="container">
          <div className="row">
            <div className="span8">
              <h2>模板代码</h2>

              <div>
                <textarea
                  style={{ width: 350, height: 400 }}
                  ref="tpl"
                  defaultValue={`
                    {{3*4*5}}
`}
                />
              </div>
              <br />
              <button ref="parse" className="ks-button" onClick={this.parse}>
                parse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

storiesOf('parse', module).add('demo', () => <Test />);
