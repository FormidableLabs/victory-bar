/*global document:false*/
import React from "react";
import {VictoryBar} from "../src/index";

class App extends React.Component {
  render() {
    return (
        <VictoryBar/>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
