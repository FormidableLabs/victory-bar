import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";

@Radium
class VictoryBar extends React.Component {

  drawStackedBars() {

    // make a copy so we don't mutate props
    const localCopyOfData = _.cloneDeep(this.props.data);

    // set up color scales, this will be abstracted
    const color = d3.scale.ordinal()
      .range(this.props.colorCategories).domain(
        d3.keys(localCopyOfData[0])
          .filter((key) => {
            return key !== "label";
          })
      );

    // each bar segment needs to know where it goes relative to the others, hence y0 y1
    localCopyOfData.forEach((bar) => {
      let y0 = 0;
      bar.segments = color.domain().map((segmentName) => {
        return {
          segmentName,
          y0,
          y1: y0 += +bar[segmentName]
        };
      });
      bar.total = bar.segments[bar.segments.length - 1].y1;
    });

    /* width / categories = x.rangeBand */
    const x = d3.scale.ordinal()
        .rangeRoundBands([0, this.props.width], .1)
        .domain(localCopyOfData.map((bar) => {
          return bar.label;
        }));

    const y = d3.scale.linear()
        .rangeRound([this.props.height, 0])
        .domain([0, d3.max(localCopyOfData, (bar) => {
          return bar.total;
        })]);

    // localCopyOfData.sort((a, b) => {
    //    return b.total - a.total;
    // });

    const stackedBars = localCopyOfData.map((bar) => {
      const scales = {
        color,
        x,
        y
      };
      return (
        <g className={"segmentGroup"} transform={"translate(" + x(bar.label) + ",0)"}>
          {this.props.makeSegments(bar.segments, scales)}
        </g>
      );
    });
    return stackedBars;
  }

  drawBars() {
    const bars = this.props.data.map((bar, i) => {
      return (
          <rect
            width={20}
            height={bar}
            x={i * 30}
            y={this.props.height - bar} />
      );
    });
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
  makeSegments: React.PropTypes.func,
  colorCategories: React.PropTypes.array
};

VictoryBar.defaultProps = {
  data: [10, 30, 50, 80, 110],
  svg: true,
  width: 800,
  height: 600,
  makeSegments: (segments) => {
    const barSvg = segments.map((segment, scales) => {
      return (
        <rect
          fill={scales.color(segment.segmentName)}
          width={scales.x.rangeBand()}
          height={scales.y(segment.y0) - scales.y(segment.y1)}
          y={scales.y(segment.y1)} />
      );
    });
    return barSvg;
  },
  colorCategories: [
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00"
  ]
};

export default VictoryBar;
