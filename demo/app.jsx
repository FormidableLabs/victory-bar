/*global document:false*/
/*global window:false*/
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
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
          y: _.random(-15, 15)
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
          y: _.random(-15, 15)
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
            horizontal
            categories={[[1, 3], [4, 7], [9, 11]]}
            animate={{velocity: 0.02}}/>

            <VictoryBar
            data={this.state.barData}
            colorScale={"yellowBlue"}
            categoryLabels={["one", "two", "three"]}
            stacked
            animate={{velocity: 0.02}}/>

            <VictoryBar/>

        </p>
      </div>
    );
  }
}

const content = document.getElementById("content");

ReactDOM.render(<App/>, content);
