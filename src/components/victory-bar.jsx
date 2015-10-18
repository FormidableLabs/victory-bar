import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

const styles = {
  base: {
    width: 500,
    height: 300,
    margin: 50
  },
  data: {
    width: 8,
    padding: 6,
    stroke: "transparent",
    strokeWidth: 0,
    fill: "#756f6a",
    opacity: 1
  },
  labels: {}
};

class VBar extends React.Component {
  static propTypes = {
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points, or an array of arrays of data points for multiple datasets.
     * Each data point should be an object with x and y properties.
     * @exampes [
     *   {x: new Date(1982, 1, 1), y: 125},
     *   {x: new Date(1987, 1, 1), y: 257},
     *   {x: new Date(1993, 1, 1), y: 345}
     * ],
     * [
     *   [{x: 5, y: 3}, {x: 4, y: 2}, {x: 3, y: 1}],
     *   [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}],
     *   [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}]
     * ]
     */
    data: React.PropTypes.oneOfType([
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
    /**
     * The dataAttributes prop describes how a data set should be styled.
     * This prop can be given as an object, or an array of objects. If this prop is
     * given as an array of objects, the properties of each object in the array will
     * be applied to the data points in the corresponding array of the data prop.
     * @exampes {color: "blue", opacity: 0.6},
     * [{color: "red"}, {color: "orange"}]
     */
    dataAttributes: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.arrayOf(React.PropTypes.object)
    ]),
    /**
     * The categories prop specifies the categories for a bar chart. This prop should
     * be given as an array of string values, numeric values, or arrays. When this prop is
     * given as an array of arrays, the minimum and maximum values of the arrays define range bands,
     * allowing numeric data to be grouped into segments.
     * @example ["dogs", "cats", "mice"], [[0, 5], [5, 10], [10, 15]]
     */
    categories: React.PropTypes.array,
    /**
     * The domain prop describes the range of values your bar chart will cover. This prop can be
     * given as a array of the minimum and maximum expected values for your bar chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @exampes [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    ]),
    /**
     * The range prop describes the range of pixels your bar chart will cover. This prop can be
     * given as a array of the minimum and maximum expected values for your bar chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a range will be calculated based on the height,
     * width, and margin provided in the style prop, or in default styles. It is usually
     * a good idea to let the chart component calculate its own range.
     * @exampes [0, 500], {x: [0, 500], y: [500, 300]}
     */
    range: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    ]),
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @exampes d3.time.scale(), {x: d3.scale.linear(), y: d3.scale.log()}
     */
    scale: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.shape({
        x: React.PropTypes.func,
        y: React.PropTypes.func
      })
    ]),
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the bar chart will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {line: {delay: 5, velocity: 10, onEnd: () => alert("woo!")}}
     */
    animate: React.PropTypes.object,
    /**
     * The stacked prop determines whether the chart should consist of stacked bars.
     * When this prop is set to false, grouped bars will be rendered instead.
     */
    stacked: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryBar relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @example {width: 500, height: 300, data: {fill: "red", opacity: 1, width: 8}}
     */
    style: React.PropTypes.object,
    /**
     * The containerElement prop specifies which element the compnent will render.
     * For standalone bars, the containerElement prop should be "svg". If you need to
     * compose bar with other chart components, the containerElement prop should
     * be "g", and will need to be rendered within an svg tag.
     */
    containerElement: React.PropTypes.oneOf(["g", "svg"])
  };

  static defaultProps = {
    stacked: false,
    scale: d3.scale.linear(),
    containerElement: "svg"
  };

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
    if (!props.style) {
      return styles;
    }
    const {data, labels, ...base} = props.style;
    return {
      base: _.merge({}, styles.base, base),
      data: _.merge({}, styles.data, data),
      labels: _.merge({}, styles.labels, labels)
    };
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
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
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
    const style = this.style.base;
    return axis === "x" ?
      [style.margin, style.width - style.margin] :
      [style.height - style.margin, style.margin];
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
    const scaleDomain = props.scale[axis] ? props.scale[axis].domain() :
      props.scale.domain();

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
      return [_.min(mapValues), _.max(mapValues)];
    } else {
      // find the global min and max
      const allData = _.flatten(_.pluck(this.datasets, "data"));
      const min = _.min(_.pluck(allData, axis));
      const max = _.max(_.pluck(allData, axis));
      // find the cumulative max for stacked chart types
      // this is only sensible for the y domain
      // TODO check assumption
      const cumulativeMax = (props.stacked && axis === "y" && this.datasets.length > 1) ?
        _.reduce(this.datasets, (memo, dataset) => {
          return memo + (_.max(_.pluck(dataset.data, axis)) - _.min(_.pluck(dataset.data, axis)));
        }, 0) : -Infinity;
      return [min, _.max([max, cumulativeMax])];
    }
  }

  getBarWidth() {
    // todo calculate / enforce max width
    return this.style.data.width;
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
    const totalWidth = this._pixelsToValue(this.style.data.padding) +
      this._pixelsToValue(this.style.data.width);
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
    return _.map(dataset.data, (data, barIndex) => {
      const minY = _.min(this.domain.y);
      const yOffset = this.getYOffset(minY, index, barIndex);
      const y0 = this.props.stacked ? yOffset : minY;
      const y1 = this.props.stacked ? yOffset + data.y : data.y;
      const x = this._adjustX(data.x, index);
      const scaledX = this.scale.x.call(this, x);
      const scaledY0 = this.scale.y.call(this, y0);
      const scaledY1 = this.scale.y.call(this, y1);
      const path = scaledX ? this.getBarPath(scaledX, scaledY0, scaledY1) : undefined;
      const style = _.merge({}, this.style.data, dataset.attrs, data);
      const pathElement = (
        <path
          d={path}
          key={"series-" + index + "-bar-" + barIndex}
          shapeRendering="optimizeSpeed"
          style={style}>
        </path>
      );
      return pathElement;
    });
  }

  plotDataPoints() {
    return _.map(this.datasets, (dataset, index) => {
      return this.getBarElements(dataset, index);
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style.base}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.style.base}>{this.plotDataPoints()}</g>
    );
  }
}

@Radium
export default class VictoryBar extends React.Component {
  /* eslint-disable react/prop-types */
  // ^ see: https://github.com/yannickcr/eslint-plugin-react/issues/106
  static propTypes = {...VBar.propTypes};
  static defaultProps = {...VBar.defaultProps};

  render() {
    if (this.props.animate) {
      return (
        <VictoryAnimation {...this.props.animate} data={this.props}>
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
