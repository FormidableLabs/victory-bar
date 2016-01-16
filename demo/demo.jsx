/*global window:false*/
import _ from "lodash";
import React from "react";
import {VictoryBar} from "../src/index";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      barData: this.getBarData(),
      numericBarData: this.getNumericBarData()
    };
  }


  getBarData() {
    return _.map(_.range(5), () => {
      return [
        {
          x: "rabbits",
          y: _.random(1, 5)
        },
        {
          x: "cats",
          y: _.random(1, 10)
        },
        {
          x: "dogs",
          y: _.random(0, 15)
        }
      ];
    });
  }

  getNumericBarData() {
    return _.map(_.range(5), () => {
      return [
        {
          x: _.random(1, 3),
          y: _.random(1, 5)
        },
        {
          x: _.random(4, 7),
          y: _.random(1, 10)
        },
        {
          x: _.random(9, 11),
          y: _.random(0, 15)
        }
      ];
    });
  }

  componentWillMount() {
    window.setInterval(() => {
      this.setState({
        barData: this.getBarData(),
        numericBarData: this.getNumericBarData()
      });
    }, 4000);
  }

  render() {
    return (
      <div className="demo">
        <p>
          <VictoryBar
            style={{parent: {border: "1px solid", margin: 10}}}
            height={500}
            data={this.state.numericBarData}
            dataAttributes={[
              {fill: "cornflowerblue"},
              {fill: "orange"},
              {fill: "greenyellow"},
              {fill: "gold"},
              {fill: "tomato"}
            ]}
            labels={["low", "medium", "high"]}
            horizontal
            categories={[[1, 3], [4, 7], [9, 11]]}
            animate={{velocity: 0.02}}
          />

          <VictoryBar
            style={{parent: {border: "1px solid", margin: 10, overflow: "visible"}}}
            data={this.state.barData}
            colorScale={"greyscale"}
            labels={["one", "two", "three"]}
            stacked
            animate={{velocity: 0.02}}
          />

            <VictoryBar/>
        </p>
      </div>
    );
  }
}
