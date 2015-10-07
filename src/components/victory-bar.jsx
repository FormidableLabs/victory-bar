import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

class VBar extends React.Component {
  constructor(props) {
    super(props);
  }

  getStyles() {
    return _.merge({
      borderColor: "transparent",
      borderWidth: 0,
      color: "#756f6a",
      opacity: 1,
      margin: 20,
      width: 500,
      height: 300,
      fontFamily: "Helvetica",
      fontSize: 10,
      textAnchor: "middle"
    }, this.props.style);
  }

  consolidateData() {
    const props = _.cloneDeep(this.props);
    const stringMap = this.getStringMap();
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
    const attributes = props.dataAttributes && props.dataAttributes[index] ?
      props.dataAttributes[index] : props.dataAttributes;
    const requiredAttributes = {
      name: attributes && attributes.name ? attributes.name : "data-" + index
    };
    return _.merge(requiredAttributes, attributes);
  }

  getStringMap() {
    return {
      x: this._createStringMap("x"),
      y: this._createStringMap("y")
    };
  }

  _createStringMap(axis) {
    const props = _.cloneDeep(this.props);
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
    } else {
      return {
        x: null,
        y: null
      };
    }
  }

  containsStrings(collection) {
    return _.some(collection, function (item) {
      return _.isString(item);
    });
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
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    return scaleDomain;
  }

  // helper method for getDomain
  _getDomainFromData(axis) {
    const stringMap = this.getStringMap();
    // if a sensible string map exists, return the minimum and maximum values
    // offset by the bar offset value
    if (stringMap[axis] !== null) {
      const mapValues = _.values(stringMap[axis]);
      const offset = this.props.categoryOffset;
      return [_.min(mapValues) - offset, _.max(mapValues) + offset];
    } else {
      const datasets = this.consolidateData();
      // find the global min and max
      const allData = _.flatten(_.pluck(datasets, "data"));
      const min = _.min(_.pluck(allData, axis));
      const max = _.max(_.pluck(allData, axis));
      // find the cumulative max for stacked chart types
      // this is only sensible for the y domain
      // TODO check assumption
      const cumulativeMax = (this.props.stacked && axis === "y") ?
        _.reduce(datasets, (memo, dataset) => {
          return memo + (_.max(_.pluck(dataset.data, axis)) - _.min(_.pluck(dataset.data, axis)));
        }, 0) : -Infinity;
      return [min, _.max([max, cumulativeMax])];
    }
  }

  getBarWidth() {
    // todo calculate / enforce max width
    return this.props.barWidth;
  }

  getBarPath(x, y0, y1) {
    const size = this.getBarWidth() / 2;
    return "M " + (x - size) + "," + y0 + " " +
      "L " + (x - size) + "," + y1 +
      "L " + (x + size) + "," + y1 +
      "L " + (x + size) + "," + y0 +
      "L " + (x - size) + "," + y0;
  }

  _pixelsToValue(pixels) {
    const xRange = this.getRange("x");
    const xDomain = this.getDomain("x");
    return (_.max(xDomain) - _.min(xDomain)) / (_.max(xRange) - _.min(xRange)) * pixels;
  }

  _adjustX(x, index) {
    const stringMap = this.getStringMap();
    if (stringMap.x === null) {
      // TODO: Check assumption
      // don't adjust x if the x axis is numeric
      return x;
    }
    const datasets = this.consolidateData();
    const center = datasets.length % 2 === 0 ?
      datasets.length / 2 : (datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this._pixelsToValue(this.props.barPadding) +
      this._pixelsToValue(this.props.barWidth);
    return x + (centerOffset * totalWidth);
  }

  getYOffset(y, index, barIndex) {
    const datasets = this.consolidateData();
    if (index === 0) {
      return y;
    }
    const previousDataSets = _.take(datasets, index);
    const previousBars = _.map(previousDataSets, (dataset) => {
      return _.pluck(dataset.data, "y");
    });
    return _.reduce(previousBars, (memo, bar) => {
      return memo + bar[barIndex];
    }, 0);
  }

  getBarElements(dataset, style, index) {
    return _.map(dataset.data, (data, barIndex) => {
      const minY = _.min(this.getDomain("y"));
      const yOffset = this.getYOffset(minY, index, barIndex);
      const y0 = this.props.stacked ? yOffset : minY;
      const y1 = this.props.stacked ? yOffset + data.y : data.y;
      const x = this.props.stacked ? data.x : this._adjustX(data.x, index);
      const scaledX = this.getScale("x").call(this, x);
      const scaledY0 = this.getScale("y").call(this, y0);
      const scaledY1 = this.getScale("y").call(this, y1);
      const path = this.getBarPath(scaledX, scaledY0, scaledY1);
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
    return _.map(this.consolidateData(), (dataset, index) => {
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

@Radium
class VictoryBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.animate) {
      return (
        <VictoryAnimation data={this.props}>
          {(props) => {
            return (
              <VBar
                {...props}
                stacked={this.props.stacked}
                scale={this.props.scale}
                animate={this.props.animate}
                containerElement={this.props.containerElement}/>
            );
          }}
        </VictoryAnimation>
      );
    }
    return (<VBar {...this.props}/>);
  }
}

const propTypes = {
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
  categoryOffset: React.PropTypes.number,
  barPadding: React.PropTypes.number,
  barWidth: React.PropTypes.number,
  animate: React.PropTypes.bool,
  stacked: React.PropTypes.bool,
  style: React.PropTypes.node,
  containerElement: React.PropTypes.oneOf(["g", "svg"])
};

const defaultProps = {
  animate: false,
  stacked: false,
  barWidth: 8,
  barPadding: 6,
  categoryOffset: 0.5,
  scale: () => d3.scale.linear(),
  containerElement: "svg"
};

VictoryBar.propTypes = propTypes;
VictoryBar.defaultProps = defaultProps;
VBar.propTypes = propTypes;
VBar.defaultProps = defaultProps;

export default VictoryBar;
