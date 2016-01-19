/*global document:false*/
import React from "react";
import { render } from "react-dom";
import Demo from "./demo";
import Perf from "./perf"

const App = () => {
  return (
    <div>
      <Demo />
      <Perf />
    </div>
  );
}

render(<App />, document.getElementById("content"));
