import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

class VBar extends React.Component {
  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.stringMap = {
      x: this.createStringMap(props, "x"),
      y: this.createStringMap(props, "y")
    };
    this.datasets = this.consolidateData(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
    this.barWidth = this.getBarWidth(props);
  }

  getStyles(props) {
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
    }, props.style);
  }

  consolidateData(props) {
    if (props.data) {
      const dataFromProps = _.isArray(props.data[0]) ? props.data : [props.data];
      return _.map(dataFromProps, (dataset, index) => {
        return {
          attrs: this._getAttributes(props, index),
          data: _.map(dataset, (data) => {
            return _.merge(data, {
              // map string data to numeric values, and add names
              x: _.isString(data.x) ? this.stringMap.x[data.x] : data.x,
              xName: _.isString(data.x) ? data.x : undefined,
              y: _.isString(data.y) ? this.stringMap.y[data.y] : data.y,
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

  containsStrings(collection) {
    return _.some(collection, function (item) {
      return _.isString(item);
    });
  }

  createStringMap(props, axis) {
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

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis]().copy() :
      props.scale().copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
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

  getRange(props, axis) {
    if (props.range) {
      return props.range[axis] ? props.range[axis] : props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    return axis === "x" ?
      [this.style.margin, this.style.width - this.style.margin] :
      [this.style.height - this.style.margin, this.style.margin];
  }

  getDomain(props, axis) {
    const categoryDomain = this._getDomainFromCategories(props, axis);
    if (props.domain) {
      return props.domain[axis] || props.domain;
    } else if (categoryDomain) {
      return categoryDomain;
    } else if (props.data) {
      return this._getDomainFromData(props, axis);
    } else {
      return this._getDomainFromScale(props, axis);
    }
  }

  _getDomainFromCategories(props, axis) {
    if (axis !== "x" || !props.categories || this.containsStrings(props.categories)) {
      return undefined;
    }
    return [_.min(_.flatten(props.categories)), _.max(_.flatten(props.categories))];
  }

  // helper method for getDomain
  _getDomainFromScale(props, axis) {
    // The scale will never be undefined due to default props
    const scaleDomain = props.scale[axis] ? props.scale[axis]().domain() :
      props.scale().domain();

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
  _getDomainFromData(props, axis) {
    // if a sensible string map exists, return the minimum and maximum values
    // offset by the bar offset value
    if (this.stringMap[axis] !== null) {
      const mapValues = _.values(this.stringMap[axis]);
      const offset = props.categoryOffset;
      return [_.min(mapValues) - offset, _.max(mapValues) + offset];
    } else {
      // find the global min and max
      const allData = _.flatten(_.pluck(this.datasets, "data"));
      const min = _.min(_.pluck(allData, axis));
      const max = _.max(_.pluck(allData, axis));
      // find the cumulative max for stacked chart types
      // this is only sensible for the y domain
      // TODO check assumption
      const cumulativeMax = (props.stacked && axis === "y") ?
        _.reduce(this.datasets, (memo, dataset) => {
          return memo + (_.max(_.pluck(dataset.data, axis)) - _.min(_.pluck(dataset.data, axis)));
        }, 0) : -Infinity;
      return [min, _.max([max, cumulativeMax])];
    }
  }

  getBarWidth(props) {
    // todo calculate / enforce max width
    return props.barWidth;
  }

  getBarPath(x, y0, y1) {
    const size = this.barWidth / 2;
    return "M " + (x - size) + "," + y0 + " " +
      "L " + (x - size) + "," + y1 +
      "L " + (x + size) + "," + y1 +
      "L " + (x + size) + "," + y0 +
      "L " + (x - size) + "," + y0;
  }

  _pixelsToValue(pixels) {
    const xRange = this.range.x;
    const xDomain = this.domain.x;
    return (_.max(xDomain) - _.min(xDomain)) / (_.max(xRange) - _.min(xRange)) * pixels;
  }

  _adjustX(x, index) {
    if (this.stringMap.x === null && !this.props.categories) {
      // don't adjust x if the x axis is numeric
      return x;
    }
    const center = this.datasets.length % 2 === 0 ?
      this.datasets.length / 2 : (this.datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this._pixelsToValue(this.props.barPadding) +
      this._pixelsToValue(this.props.barWidth);
    if (this.props.categories && _.isArray(this.props.categories[0])) {
      // figure out which band this x value belongs to, and shift it to the
      // center of that band before calculating the usual offset
      const xBand = _.filter(this.props.categories, (band) => {
        return (x >= _.min(band) && x <= _.max(band));
      });
      const bandCenter = _.isArray(xBand[0]) && (_.max(xBand[0]) + _.min(xBand[0])) / 2;
      return this.props.stacked ? bandCenter : bandCenter + (centerOffset * totalWidth);
    }
    return this.props.stacked ? x : x + (centerOffset * totalWidth);
  }

  getYOffset(y, index, barIndex) {
    if (index === 0) {
      return y;
    }
    const previousDataSets = _.take(this.datasets, index);
    const previousBars = _.map(previousDataSets, (dataset) => {
      return _.pluck(dataset.data, "y");
    });
    return _.reduce(previousBars, (memo, bar) => {
      return memo + bar[barIndex];
    }, 0);
  }

  getBarElements(dataset, index) {
    // create one path for all bars of the same data series
    const path = _.reduce(dataset.data, (memo, data, barIndex) => {
      const minY = _.min(this.domain.y);
      const yOffset = this.getYOffset(minY, index, barIndex);
      const y0 = this.props.stacked ? yOffset : minY;
      const y1 = this.props.stacked ? yOffset + data.y : data.y;
      const x = this._adjustX(data.x, index);
      const scaledX = this.scale.x.call(this, x);
      const scaledY0 = this.scale.y.call(this, y0);
      const scaledY1 = this.scale.y.call(this, y1);
      const partialPath = scaledX ? this.getBarPath(scaledX, scaledY0, scaledY1) : "";
      return memo + partialPath;
    }, "");

    return (
      <path
        d={path}
        fill={dataset.attrs.color || this.style.color || "blue"}
        key={"series-" + index}
        opacity={dataset.attrs.opacity || this.style.opacity || 1}
        shapeRendering="optimizeSpeed"
        stroke="transparent"
        strokeWidth={0}>
      </path>
    );
  }

  plotDataPoints() {
    return _.map(this.datasets, (dataset, index) => {
      return this.getBarElements(dataset, index);
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.style}>{this.plotDataPoints()}</g>
    );
  }
}

@Radium
class VictoryBar extends React.Component {

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
                categoryOffset={this.props.categoryOffset}
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
  categories: React.PropTypes.array,
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
