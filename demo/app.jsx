/*global document:false*/
import React from "react";
import {VictoryBar} from "../src/index";
import data from "./data";

class App extends React.Component {
  render() {
    return (
      <VictoryBar
        data={data}/>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
