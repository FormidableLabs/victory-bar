/*global document:false*/
/*global window:false*/
import _ from "lodash";
import React from "react";
import {VictoryBar} from "../src/index";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      barData: this.getBarData()
    };
  }


  getBarData() {
    return _.map(_.range(5), () => {
      return [
        {
          x: "red",
          y: _.random(1, 5)
        },
        {
          x: "green",
          y: _.random(1, 10)
        },
        {
          x: "blue",
          y: _.random(1, 15)
        }
      ];
    });
  }

  componentWillMount() {
    window.setInterval(() => {
      this.setState({
        barData: this.getBarData()
      });
    }, 4000);
  }

  render() {
    return (
      <div className="demo">
        <p>

          <VictoryBar
            data={this.state.barData}
            dataAttributes={[
              {color: "cornflowerblue"},
              {color: "orange"},
              {color: "greenyellow"},
              {color: "gold"},
              {color: "tomato"}
            ]}
            domainOffset={{
              x: 0.2,
              y: 0
            }}
            animate={true}/>

        </p>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
