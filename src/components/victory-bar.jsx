import React from "react";
import Radium from "radium";
import lodash from "lodash";

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

  drawStackedBars () {

    // make a copy so we don't mutate props
    let localCopyOfData = _.cloneDeep(this.props.data);

    var color = d3.scale.ordinal().range(
      ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]
    ).domain(legend);

    localCopyOfData.forEach((bar) => {
      var y0 = 0;
      bar.segments = color.domain().map((segmentName) => {
        return {
          segmentName: segmentName,
          y0: y0,
          y1: y0 += +bar[segmentName]
        };
      });
      bar.total = bar.ages[bar.ages.length - 1].y1;
    });

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(localCopyOfData.map((bar) => {
          return bar.label;
        }));

    var y = d3.scale.linear()
        .rangeRound([height, 0])
        .domain([0, d3.max(localCopyOfData, (bar) => {
          return bar.total;
        })]);

    // localCopyOfData.sort((a, b) => {
    //    return b.total - a.total;
    // });

    function makeSegments (segments, i) {
      var barSvg = segments.map((segment) => {
        return (
          <rect
            width={x.rangeBand()}
            height={y(segment.y0) - y(segment.y1)}
            y={y(segment.y1)} />
        )
      })
      return barSvg;
    })

    const stackedBars = dataWithSegmentsAdded.map((bar, i) => {
      return (
        <g tranform={"translate(" + x(bar.label) + ",0)"}>
          {makeSegments(bar.segments)}
        </g>
      )
    })
    return stackedBars;

  }

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
          {_.isArray(this.props.data[0]) ? this.drawStackedBars() : this.drawBars()}
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
