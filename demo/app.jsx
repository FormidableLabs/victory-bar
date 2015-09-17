/*global document:false*/
import React from "react";
import {VictoryBar} from "../src/index";
import data from "./data";

class App extends React.Component {
  render() {
    return (
      <svg
        width={800}
        height={600}
        className={"SVG-OUTSIDE-COMPONENT"}
        style={{border: "1px solid black"}}>
        <VictoryBar
          data={data}
          barPadding={0.5}
          totalReductionInX={600}
          totalReductionInY={500}
          translateX={100}
          translateY={300}
          svg={false}/>
      </svg>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
