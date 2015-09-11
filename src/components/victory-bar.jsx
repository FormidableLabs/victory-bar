import React from "react";
import Radium from "radium";
import lodash from "lodash";
import d3 from "d3";

@Radium
class VictoryBar extends React.Component {

  drawStackedBars () {

    // make a copy so we don't mutate props
    let localCopyOfData = _.cloneDeep(this.props.data);

    // set up color scales, this will probably be abstracted
    var color = d3.scale.ordinal().range(
      ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]
    ).domain(d3.keys(localCopyOfData[0]).filter(function(key) { return key !== "label"; }));

    // each bar segment needs to know where it goes relative to the others, hence y0 y1
    localCopyOfData.forEach((bar) => {
      var y0 = 0;
      bar.segments = color.domain().map((segmentName) => {
        return {
          segmentName: segmentName,
          y0: y0,
          y1: y0 += +bar[segmentName]
        };
      });
      bar.total = bar.segments[bar.segments.length - 1].y1;
    });

    // rangeRoundBands say how many categories, how much width, does the division, x.rangeBand called below
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, this.props.width], .1)
        .domain(localCopyOfData.map((bar) => {
          return bar.label;
        }));

    var y = d3.scale.linear()
        .rangeRound([this.props.height, 0])
        .domain([0, d3.max(localCopyOfData, (bar) => {
          return bar.total;
        })]);

    // localCopyOfData.sort((a, b) => {
    //    return b.total - a.total;
    // });

    function makeSegments (segments, i) {
      var barSvg = segments.map((segment) => {
        debugger
        return (
          <rect
            fill={color(segment.segmentName)}
            width={x.rangeBand()}
            height={y(segment.y0) - y(segment.y1)}
            y={y(segment.y1)} />
        )
      })
      return barSvg;
    }

    const stackedBars = localCopyOfData.map((bar, i) => {
      return (
        <g className={"segmentGroup"} transform={"translate(" + x(bar.label) + ",0)"}>
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
          {_.isObject(this.props.data[0]) ? this.drawStackedBars() : this.drawBars()}
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
