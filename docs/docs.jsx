import React from 'react';
import ReactDOM from 'react-dom';
import Ecology from 'ecology';
import Radium, { Style } from 'radium';
import {VictoryLabel} from 'victory-label';

import { VictoryTheme } from 'formidable-landers';

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require('!!raw!./ecology.md')}
          source={require('json!./victory-bar.json')}
          scope={{
            React,
            ReactDOM,
            VictoryLabel,
            VictoryBar: require('../src/components/victory-bar')}}
          playgroundtheme='elegant' />
        <Style rules={VictoryTheme}/>
      </div>
    )
  }
}

export default Docs;
