import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";

@Radium
class VictoryBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.stringMap = {
      x: this.createStringMap(props, "x"),
      y: this.createStringMap(props, "y")
    };
    this.state.data = this.consolidateData(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      stringMap: {
        x: this.createStringMap(nextProps, "x"),
        y: this.createStringMap(nextProps, "y")
      },
      data: this.consolidateData(nextProps)
    });
  }

  createStringMap(originalProps, axis) {
    const props = _.cloneDeep(originalProps);
    // if categories exist and are strings, create a map using only those strings
    // dont alter the order.
    const categories = props.categories ?
      (props.categories[axis] || props.categories) : undefined;
    if (categories && this.containsStrings(categories)) {
      return _.zipObject(_.map(categories, (tick, index) => {
        return ["" + tick, index + 1];
      }));
    }
    // collect strings from props.data
    if (props.data) {
      const data = _.isArray(props.data) ? _.flattenDeep(props.data) : props.data;
      // create a unique, sorted set of strings
      const stringData = _.chain(data)
        .pluck(axis)
        .map((datum) => {
          return _.isString(datum) ? datum : null;
        })
        .compact()
        .uniq()
        .sort()
        .value();

      return _.isEmpty(stringData) ?
        null :
        _.zipObject(_.map(stringData, (string, index) => {
          return [string, index + 1];
        }));
    }
    else {
      return {
        x: null,
        y: null
      };
    }
  }

  containsStrings(collection) {
    return _.some(collection, function (item) {
      return _.isString(item);
    })
  }

  consolidateData(originalProps) {
    const props = _.cloneDeep(originalProps);
    if (props.data) {
      const dataFromProps = _.isArray(props.data[0]) ? props.data : [props.data];
      return _.map(dataFromProps, (dataset, index) => {
        return {
          attrs: this._getAttributes(props, index),
          data: _.map(dataset, (data) => {
            return _.merge(data, {
              // map string data to numeric values, and add names
              x: _.isString(data.x) ? stringMap.x[data.x] : data.x,
              xName: _.isString(data.x) ? data.x : undefined,
              y: _.isString(data.y) ? stringMap.y[data.y] : data.y,
              yName: _.isString(data.y) ? data.y : undefined
            });
          })
        };
      });
    } else {
      return [{
        attrs: {},
        data: []
      }];
    }
  }

  _getAttributes(props, index) {
    // type is y or data
    const attributes = props.dataAttributes && props.dataAttributes[index] ?
      props.dataAttributes[index] : props.dataAttributes;
    const requiredAttributes = {
      name: attributes && attributes.name ? attributes.name : "data-" + index,
    };
    return _.merge(requiredAttributes, attributes);
  }

  getStyles() {
    return _.merge({
      borderColor: "transparent",
      borderWidth: 0,
      color: "#756f6a",
      opacity: 1,
      margin: 20,
      width: 500,
      height: 500,
      fontFamily: "Helvetica",
      fontSize: 10,
      textAnchor: "middle"
    }, this.props.style);
  }

  getScale(axis) {
    const scale = this.props.scale[axis] ? this.props.scale[axis]().copy() :
      this.props.scale().copy();
    const range = this.getRange(axis);
    const domain = this.getDomain(axis);
    scale.range(range);
    scale.domain(domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(range);
      scale.domain(range);
    }
    return scale;
  }

  getRange(axis) {
    if (this.props.range) {
      return this.props.range[axis] ? this.props.range[axis] : this.props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    const style = this.getStyles();
    return axis === "x" ?
      [style.margin, style.width - style.margin] :
      [style.height - style.margin, style.margin];
  }

  getDomain(axis) {
    if (this.props.domain) {
      return this.props.domain[axis] || this.props.domain;
    } else if (this.props.data) {
      return this._getDomainFromData(axis);
    } else {
      return this._getDomainFromScale(axis);
    }
  }

  // helper method for getDomain
  _getDomainFromScale(axis) {
    // The scale will never be undefined due to default props
    const scaleDomain = this.props.scale[axis] ? this.props.scale[axis]().domain() :
      this.props.scale().domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    // if (_.isDate(scaleDomain[0])) {
    //   log.warn("please specify a domain or data when using time scales");
    // } else if (scaleDomain.length === 0) {
    //   log.warn("please specify a domain or data when using ordinal or quantile scales");
    // } else if (scaleDomain.length === 1) {
    //   log.warn("please specify a domain or data when using a threshold scale");
    // }
    return scaleDomain;
  }

  // helper method for getDomain
  _getDomainFromData(axis) {
    // if a sensible string map exists, return the minimum and maximum values
    // offset by the tick margin value
    if (!!this.state.stringMap[axis]) {
      const mapValues = _.values(this.state.stringMap[axis]);
      const margin = this.props.barMargin;
      return [_.min(mapValues) - margin, _.max(mapValues) + margin];
    } else {
      // find the global min and max
      const allData =  _.flatten(_.pluck(this.state.data, "data"));
      const min = _.min(_.pluck(allData, axis));
      const max = _.max(_.pluck(allData, axis));
      // find the cumulative max for stacked chart types
      // this is only sensible for the y domain
      const cumulativeMax = (this.props.stacked && axis === "y") ?
        _.reduce(this.state.data, (memo, dataset) => {
          return memo + (_.max(_.pluck(dataset.data, axis)) - _.min(_.pluck(dataset.data, axis)));
        }, 0) : -Infinity
      return [min, _.max([max, cumulativeMax])];
    }
  }

  // getBarPoints() {
  //   const axis = "x"; // bar charts should always start from the independent variable
  //   const scale = this.getScale(axis);
  //   // if barPoints are defined in props, and dont contain strings, just return them
  //   if (this.props.barPoints && !this.containsStrings(this.props.barPoints)) {
  //     return this.props.barPoints;
  //   } else if (!!this.state.stringMap[axis]) {
  //     // category values should have one tick of padding on either side
  //     const barPoints = this.props.barPoints ?
  //       _.map(this.props.barPoints, (bar) => this.state.stringMap[axis][bar]) :
  //       _.values(this.state.stringMap[axis]);
  //     const margin = this.props.barMargin;
  //     return [
  //       _.min(barPoints) - margin,
  //       ...barPoints,
  //       _.max(barPoints) + margin
  //     ];
  //   } else if (_.isFunction(scale.ticks)) {
  //     const bars = scale.ticks(this.props.barCount);
  //     return _.without(bars, 0);
  //   } else {
  //     return scale.domain();
  //   }
  // }

  getBarWidth() {
    return this.props.barWidth;
    // const seriesCount = this.state.data.length;
    // const dataCount = _.max(_.map(_.pluck(this.state.data, "data"), (dataset) => {
    //   return _.pluck(dataset, "x").length
    // }));
    // const barCount = this.props.stacked ? dataCount : dataCount * seriesCount;
    // const allowedLength = this.getRange("x");
    // const outerPadding = (dataCount - 2) * this.props.outerPadding;
    // const innerPadding = (seriesCount - 2) * this.props.innerPadding
    // const totalPadding = this.props.stacked ? outerPadding : outerPadding + innerPadding;
    // const maxWidth = allowedLength - totalPadding / (barCount);
    // return _.min([this.props.width, maxWidth]);
  }

  getBarPath(x, y0, y1, width) {
    const size = width / 2;
    return "M " + (x - size) + "," + y0 + " " +
      "L " + (x - size) + "," + y1 +
      "L " + (x + size) + "," + y1 +
      "L " + (x + size) + "," + y0 +
      "L " + (x - size) + "," + y0;
  }

  _adjustX(x, index, barIndex) {

    if (this.state.stringMap.x === null) {
      // don't adjust x if the x axis is numeric
      return x;
    }
    const center = this.state.data.length % 2 === 0 ?
      this.state.data.length / 2 : (this.state.data.length - 1) / 2;
    const centerOffset = index - center;
    return x + (centerOffset * 0.1);
  }

  _adjustY0(y, index, barIndex) {
    if (index === 0) {
      return y;
    }
    const previousDataSet = this.state.data[index - 1];
    const previousBar = previousDataSet.data[barIndex];
    return previousBar.y;
  }

  _adjustY1(y, index, barIndex) {
    if (index === 0) {
      return y;
    }
    const previousDataSet = this.state.data[index - 1];
    const previousBar = previousDataSet.data[barIndex]
    return previousBar.y + y;
  }

  getBarElements(dataset, style, index) {
    return _.map(dataset.data, (data, barIndex) => {
      const minY = _.min(this.getDomain("y"));
      const y0 = this.props.stacked ? this._adjustY0(minY, index, barIndex) : minY;
      const y1 = this.props.stacked ? this._adjustY1(data.y, index, barIndex) : data.y;
      const x = this.props.stacked ? data.x : this._adjustX(data.x, index, barIndex);
      const scaledX = this.getScale("x").call(this, x);
      const scaledY0 = this.getScale("y").call(this, y0);
      const scaledY1 = this.getScale("y").call(this, y1);
      const width = this.getBarWidth();
      const path = this.getBarPath(scaledX, scaledY0, scaledY1, width);
      const pathElement = (
        <path
          d={path}
          fill={dataset.attrs.color || style.color || "blue"}
          key={"series-" + index + "-bar-" + barIndex}
          opacity={dataset.attrs.opacity || style.opacity || 1}
          shapeRendering="optimizeSpeed"
          stroke="transparent"
          strokeWidth={0}>
        </path>
      );
      return pathElement;
    });
  }

  plotDataPoints() {
    return _.map(this.state.data, (dataset, index) => {
      const style = this.getStyles();
      return this.getBarElements(dataset, style, index);
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.getStyles()}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.getStyles()}>{this.plotDataPoints()}</g>
    );
  }
}

VictoryBar.propTypes = {
  data: React.PropTypes.oneOfType([ // maybe this should just be "node"
    React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.any,
        y: React.PropTypes.any
      })
    ),
    React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          x: React.PropTypes.any,
          y: React.PropTypes.any
        })
      )
    )
  ]),
  dataAttributes: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.arrayOf(React.PropTypes.object)
  ]),
  categories: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.shape({
      x: React.PropTypes.func,
      y: React.PropTypes.func
    })
  ]),
  orientation: React.PropTypes.oneOf(["top", "bottom", "left", "right"]),
  barMargin: React.PropTypes.number,
  innerPadding: React.PropTypes.number,
  outerPadding: React.PropTypes.number,
  barWidth: React.PropTypes.number,
  animate: React.PropTypes.bool,
  stacked: React.PropTypes.bool,
  style: React.PropTypes.node,
  labelPadding: React.PropTypes.number,
  showLabels: React.PropTypes.bool,
  containerElement: React.PropTypes.oneOf(["g", "svg"])
};

VictoryBar.defaultProps = {
  animate: false,
  stacked: false,
  barWidth: 8,
  barMargin: 0.5,
  innerPadding: 2,
  outerPadding: 4,
  scale: () => d3.scale.linear(),
  showLabels: true,
  containerElement: "svg"
};

export default VictoryBar;
