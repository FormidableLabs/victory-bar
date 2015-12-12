import React from "react";
import ReactDOM from "react-dom";
import Ecology from "ecology";
import Radium, { Style } from "radium";
import {VictoryLabel} from "victory-label";
import * as docgen from "react-docgen";

import { VictoryTheme } from "formidable-landers";

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require("!!raw!./ecology.md")}
          source={docgen.parse(require("!!raw!../src/components/victory-bar"))}
          scope={{
            React,
            ReactDOM,
            VictoryLabel,
            VictoryBar: require("../src/components/victory-bar")}}
          playgroundtheme="elegant" />
        <Style rules={VictoryTheme}/>
      </div>
    )
  }
}

export default Docs;
