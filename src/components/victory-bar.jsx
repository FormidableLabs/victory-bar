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
    _.forEach(localCopyOfData, (bar) => {
      let y0 = 0;
      bar.segments = _.map(color.domain(), (segmentName) => {
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
      .rangeRoundBands([0, this.props.width - this.props.totalReductionInX], this.props.barPadding)
      .domain(_.map(localCopyOfData, (bar) => {
        return bar.label;
      }));

    const y = d3.scale.linear()
      .rangeRound([this.props.height - this.props.totalReductionInY, 0])
      .domain([0, d3.max(localCopyOfData, (bar) => {
        return bar.total;
      })]);

    // localCopyOfData.sort((a, b) => {
    //    return b.total - a.total;
    // });

    return _.map(localCopyOfData, (bar, i) => {
      const scales = {
        color,
        x,
        y
      };

      return (
        <g
          key={i}
          className={"segmentGroup"}
          transform={"translate(" + x(bar.label) + ",0)"}>
          {this.props.makeSegments(bar.segments, scales)}
        </g>
      );
    });
  }

  drawBars() {
    return _.map(this.props.data, (bar, i) => {
      return (
        <rect
          key={i}
          width={20}
          height={bar}
          x={i * 30}
          y={this.props.height - bar}/>
      );
    });
  }

  // offsets and squishing to fit inside axis
  render() {
    if (this.props.svg) {
      return (
        <svg width={this.props.width} height={this.props.height}>
          <g transform={"translate(" + this.props.translateX + "," + this.props.translateY + ")"}>
            { _.isObject(this.props.data[0]) ? this.drawStackedBars() : this.drawBars() }
          </g>
        </svg>
      );
    }

    return (
      <g transform={"translate(" + this.props.translateX + "," + this.props.translateY + ")"}>
        { _.isObject(this.props.data[0]) ? this.drawStackedBars() : this.drawBars() }
      </g>
    );
  }
}

VictoryBar.propTypes = {
  barPadding: React.PropTypes.number,
  data: React.PropTypes.array,
  svg: React.PropTypes.bool,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  makeSegments: React.PropTypes.func,
  colorCategories: React.PropTypes.array,
  translateX: React.PropTypes.number,
  translateY: React.PropTypes.number,
  totalReductionInY: React.PropTypes.number,
  totalReductionInX: React.PropTypes.number
};

VictoryBar.defaultProps = {
  barPadding: 0.1,
  data: [10, 30, 50, 80, 110],
  svg: true,
  width: 800,
  height: 600,
  makeSegments: (segments, scales) => {
    return _.map(segments, (segment, i) => {
      return (
        <rect
          key={i}
          fill={scales.color(segment.segmentName)}
          width={scales.x.rangeBand()}
          height={scales.y(segment.y0) - scales.y(segment.y1)}
          y={scales.y(segment.y1)}/>
      );
    });
  },
  colorCategories: [
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00"
  ],
  totalReductionInX: 0,
  totalReductionInY: 0,
  translateX: 0,
  translateY: 0
};

export default VictoryBar;
