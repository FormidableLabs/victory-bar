import React, { Component } from "react";
import { VictoryBar } from "../src/index";

let dataCount = 1000;
let updateInterval = 100;

const getData = () => {
  let data = []
  for (let i = 0; i < dataCount; i++) {
    data.push({
      x: i, y: Math.round(Math.random() * 100)
    });
  }
  return data
}

export default class Perf extends Component {
  constructor() {
    super();

    this.state = {
      data: getData()
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        data: getData()
      })
    }, updateInterval)
  }

  render() {
    return (
      <VictoryBar
        data={this.state.data}
        domain={{ y: [0, 100] }}
        width={800}
        height={500}
      />
    );
  }
}
