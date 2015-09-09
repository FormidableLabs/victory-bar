import React from "react";
import Radium from "radium";


@Radium
class VictoryBar extends React.Component {
  // getStyles() {
  //   return {
  //     base: {
  //       color: "#000",
  //       fontSize: 12,
  //       textDecoration: "underline"
  //     },
  //     red: {
  //       color: "#d71920",
  //       fontSize: 30
  //     }
  //   };
  // }

  drawBars() {
    const bars = this.props.data.map((d, i) => {
      return (
        <rect
          width={20}
          height={d}
          x={i * 30}
          y={this.props.height - d} />
      )
    })
    return bars;
  }

  render() {
    // const styles = this.getStyles();
    return (
      <svg width={this.props.width} height={this.props.height}>
        <g>
          {this.drawBars()}
        </g>
      </svg>
    );
  }
}

VictoryBar.propTypes = {
  data: React.PropTypes.array,
  svg: React.PropTypes.bool,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
};

VictoryBar.defaultProps = {
  data: [10,30,50,80,110],
  svg: true,
  width: 800,
  height: 600,
}

export default VictoryBar;
