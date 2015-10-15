/*global document:false*/
/*global window:false*/
import _ from "lodash";
import React from "react";
import {VictoryBar} from "../src/index";

class App extends React.Component {
  constructor(props) {
    super(props);
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
          y: _.random(1, 15)
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
          y: _.random(1, 15)
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
            data={this.state.numericBarData}
            dataAttributes={[
              {fill: "cornflowerblue"},
              {fill: "orange"},
              {fill: "greenyellow"},
              {fill: "gold"},
              {fill: "tomato"}
            ]}
            categories={[[1, 3], [4, 7], [9, 11]]}
            containerElement="svg"
            animate={{velocity: 0.02}}/>

            <VictoryBar
            data={this.state.barData}
            dataAttributes={[
              {fill: "cornflowerblue"},
              {fill: "orange"},
              {fill: "greenyellow"},
              {fill: "gold"},
              {fill: "tomato"}
            ]}
            stacked={true}
            containerElement="svg"
            animate={{velocity: 0.02}}/>


        </p>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
