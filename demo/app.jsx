/*global document:false*/
import React from "react";
import {VictoryBar} from "../src/index";
import data from "./data";

class App extends React.Component {
  render() {
    return (
      <div>


        <svg
          width={800}
          height={600}
          className={"SVG-OUTSIDE-COMPONENT"}
          style={{border: "1px solid black"}}>
          <VictoryBar
            data={[
              {x: 1, y: 3},
              {x: 2, y: 5},
              {x: 3, y: 2},
              {x: 4, y: 4},
              {x: 5, y: 6}
            ]}
            barPadding={0.5}
            containerElement="g"/>
        </svg>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
