import React, { PropTypes } from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import {VictoryAnimation} from "victory-animation";
import Util from "victory-util";
import {VictoryLabel} from "victory-label";

const defaultStyles = {
  data: {
    width: 8,
    padding: 6,
    stroke: "transparent",
    strokeWidth: 0,
    fill: "#756f6a",
    opacity: 1
  },
  labels: {
    fontSize: 12,
    padding: 4
  }
};

const defaultData = [
  {x: 1, y: 1},
  {x: 2, y: 2},
  {x: 3, y: 3},
  {x: 4, y: 4}
];

@Radium
export default class VictoryBar extends React.Component {
  static role = "bar";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the bar chart will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points, or an array of arrays of data points for multiple datasets.
     * Each data point should be an object with x and y properties.
     * @examples [{x: 1, y:2}, {x: 2, y: 3}],
     * [[{x: "a", y: 1}, {x: "b", y: 2}], [{x: "a", y: 2}, {x: "b", y: 3}]]
     */
    data: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.any,
          y: PropTypes.any
        })
      ),
      PropTypes.arrayOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            x: PropTypes.any,
            y: PropTypes.any
          })
        )
      )
    ]),
    /**
     * The dataAttributes prop describes how a data set should be styled.
     * This prop can be given as an object, or an array of objects. If this prop is
     * given as an array of objects, the properties of each object in the array will
     * be applied to the data points in the corresponding array of the data prop.
     * @examples {fill: "blue", opacity: 0.6}, [{fill: "red"}, {fill: "orange"}]
     */
    dataAttributes: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    /**
     * The categories prop specifies the categories for a bar chart. This prop should
     * be given as an array of string values, numeric values, or arrays. When this prop is
     * given as an array of arrays, the minimum and maximum values of the arrays define range bands,
     * allowing numeric data to be grouped into segments.
     * @examples ["dogs", "cats", "mice"], [[0, 5], [5, 10], [10, 15]]
     */
    categories: Util.PropTypes.homogenousArray,
    /**
     * The colorScale prop is an optional prop that defines the color scale the chart's bars
     * will be created on. This prop should be given as a string, which will one of the five
     * baked-in color scales: "victory", "grayscale", "red", "bluePurple", and "yellowBlue".
     * If it is not defined, the default Victory grayscale will be used, and if the fill
     * property on the dataAttributes prop is defined, it will overwrite the colorScale prop.
     * The user can pass in an array of hex string values to use as their own scale, and
     * VictoryBar will automatically assign values from this color scale to the bars.
     */
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "victory", "gray", "red", "bluePurple", "yellowBlue"
      ])
    ]),
    /**
     * The domain prop describes the range of values your bar chart will cover. This prop can be
     * given as a array of the minimum and maximum expected values for your bar chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @examples [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: PropTypes.oneOfType([
      Util.PropTypes.minMaxArray,
      PropTypes.shape({
        x: Util.PropTypes.minMaxArray,
        y: Util.PropTypes.minMaxArray
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: Util.PropTypes.nonNegative,
    /**
     * The horizontal prop determines whether the bars will be laid vertically or
     * horizontally. The bars will be vertical if this prop is false or unspecified,
     * or horizontal if the prop is set to true.
     */
    horizontal: PropTypes.bool,
    /**
     * The labels prop defines labels that will appear above each bar or
     * group of bars in your bar chart. This prop should be given as an array of values.
     * The number of elements in the label array should be equal to number of elements in
     * the categories array, or if categories is not defined, to the number of unique
     * x values in your data. Use this prop to add labels to individual bars, stacked bars,
     * and groups of bars.
     * @examples: ["spring", "summer", "fall", "winter"]
     */
    labels: PropTypes.array,
    /**
     * The labelComponents prop takes in an array of entire, HTML-complete label components
     * which will be used to create labels for individual bars, stacked bars, or groups of
     * bars as appropriate.
     */
    labelComponents: PropTypes.array,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @examples d3.time.scale(), {x: d3.scale.linear(), y: d3.scale.log()}
     */
    scale: PropTypes.oneOfType([
      Util.PropTypes.scale,
      PropTypes.shape({
        x: Util.PropTypes.scale,
        y: Util.PropTypes.scale
      })
    ]),
    /**
     * The stacked prop determines whether the chart should consist of stacked bars.
     * When this prop is set to false, grouped bars will be rendered instead.
     */
    stacked: PropTypes.bool,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryBar with other components within an enclosing <svg> tag.
     */
    standalone: PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryBar relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @examples {data: {fill: "red", width: 8}, labels: {fontSize: 12}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: Util.PropTypes.nonNegative
  };

  static defaultProps = {
    data: defaultData,
    height: 300,
    padding: 50,
    scale: d3.scale.linear(),
    stacked: false,
    standalone: true,
    width: 450
  };

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.padding = this.getPadding(props);
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
    this.barWidth = this.getBarWidth();
  }

  getStyles(props) {
    const style = props.style || defaultStyles;
    const {data, labels, parent} = style;
    return {
      parent: _.merge({height: props.height, width: props.width}, parent),
      data: _.merge({}, defaultStyles.data, data),
      labels: _.merge({}, defaultStyles.labels, labels)
    };
  }

  getPadding(props) {
    const padding = _.isNumber(props.padding) ? props.padding : 0;
    const paddingObj = _.isObject(props.padding) ? props.padding : {};
    return {
      top: paddingObj.top || padding,
      bottom: paddingObj.bottom || padding,
      left: paddingObj.left || padding,
      right: paddingObj.right || padding
    };
  }

  consolidateData(props) {
    const dataFromProps = _.isArray(props.data[0]) ? props.data : [props.data];
    return _.map(dataFromProps, (dataset, index) => {
      return {
        attrs: this.getAttributes(props, index),
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
  }

  getAttributes(props, index) {
    let attributes = props.dataAttributes && props.dataAttributes[index] ?
      props.dataAttributes[index] : props.dataAttributes;
    if (attributes) {
      attributes.fill = attributes.fill || this.getColor(props, index);
    } else {
      attributes = {fill: this.getColor(props, index)};
    }
    const requiredAttributes = {
      name: attributes && attributes.name ? attributes.name : `data-${index}`
    };
    return _.merge(requiredAttributes, attributes);
  }

  getColor(props, index) {
    // check for styles first
    if (props.style && props.style.data && props.style.data.fill) {
      return props.style.data.fill;
    }
    const colorScale = _.isArray(props.colorScale) ?
      props.colorScale : Util.Style.getColorScale(props.colorScale);
    return colorScale[index % colorScale.length];
  }

  createStringMap(props, axis) {
    // if categories exist and are strings, create a map using only those strings
    // don't alter the order.
    if (props.categories && Util.Collection.containsStrings(props.categories)) {
      return _.zipObject(_.map(props.categories, (tick, index) => {
        return [`${tick}`, index + 1];
      }));
    }
    // collect strings from data
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

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    return scale;
  }

  getRange(props, axis) {
    // determine how to lay the axis and what direction positive and negative are
    const isVertical =
      !this.props.horizontal && axis === "x" || this.props.horizontal && axis !== "x";

    return isVertical ? [this.padding.left, props.width - this.padding.right] :
      [props.height - this.padding.bottom, this.padding.top];
  }

  getDomain(props, axis) {
    const categoryDomain = this.getDomainFromCategories(props, axis);
    if (props.domain && props.domain[axis]) {
      return props.domain[axis];
    } else if (props.domain && _.isArray(props.domain)) {
      return props.domain;
    } else if (categoryDomain) {
      return categoryDomain;
    } else {
      return this.getDomainFromData(props, axis);
    }
  }

  getDomainFromCategories(props, axis) {
    if (axis !== "x" || !props.categories || Util.Collection.containsStrings(props.categories)) {
      return undefined;
    }
    return [_.min(_.flatten(props.categories)), _.max(_.flatten(props.categories))];
  }

  getDomainFromData(props, axis) {
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
          const localMax = (_.max(_.pluck(dataset.data, "y")));
          return localMax > 0 ? memo + localMax : memo;
        }, 0) : -Infinity;
      const cumulativeMin = (props.stacked && axis === "y" && this.datasets.length > 1) ?
        _.reduce(this.datasets, (memo, dataset) => {
          const localMin = (_.min(_.pluck(dataset.data, "y")));
          return localMin < 0 ? memo + localMin : memo;
        }, 0) : Infinity;

      // use greatest min / max
      const domainMin = _.min([min, cumulativeMin]);
      const domainMax = _.max([max, cumulativeMax]);
      // add 1% padding so bars are always visible
      const padding = 0.01 * Math.abs(domainMax - domainMin);
      return [domainMin - padding, domainMax - padding];
    }
  }

  getBarWidth() {
    // todo calculate / enforce max width
    return this.style.data.width;
  }

  /*
   * helper method for getBarPath
   * called when the bars will be vertical
   */
  getVerticalBarPath(position) {
    const {independent, dependent0, dependent1} = position;
    const size = this.barWidth / 2;
    return `M ${independent - size}, ${dependent0}
      L ${independent - size}, ${dependent1}
      L ${independent + size}, ${dependent1}
      L ${independent + size}, ${dependent0}
      L ${independent - size}, ${dependent0}`;
  }

  /*
   * helper method for getBarPath
   * called when the bars will be horizonal
   */
  getHorizontalBarPath(position) {
    const {independent, dependent0, dependent1} = position;
    const size = this.barWidth / 2;
    return `M ${dependent0}, ${independent - size}
      L ${dependent0}, ${independent + size}
      L ${dependent1}, ${independent + size}
      L ${dependent1}, ${independent - size}
      L ${dependent0}, ${independent - size}`;
  }

  getBarPath(position) {
    return this.props.horizontal ?
      this.getHorizontalBarPath(position) : this.getVerticalBarPath(position);
  }

  pixelsToValue(pixels) {
    const xRange = this.range.x;
    const xDomain = this.domain.x;
    return (_.max(xDomain) - _.min(xDomain)) / (_.max(xRange) - _.min(xRange)) * pixels;
  }

  adjustX(x, index, options) {
    const stacked = options && options.stacked;
    const center = this.datasets.length % 2 === 0 ?
      this.datasets.length / 2 : (this.datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this.pixelsToValue(this.style.data.padding) +
      this.pixelsToValue(this.style.data.width);
    if (this.props.categories && _.isArray(this.props.categories[0])) {
      // figure out which band this x value belongs to, and shift it to the
      // center of that band before calculating the usual offset
      const xBand = _.filter(this.props.categories, (band) => {
        return (x >= _.min(band) && x <= _.max(band));
      });
      const bandCenter = _.isArray(xBand[0]) && (_.max(xBand[0]) + _.min(xBand[0])) / 2;
      return stacked ? bandCenter : bandCenter + (centerOffset * totalWidth);
    }
    return stacked ? x : x + (centerOffset * totalWidth);
  }

  getYOffset(data, index, barIndex) {
    const minY = _.min(this.domain.y);
    if (index === 0) {
      return _.max([minY, 0]);
    }
    const y = data.y;
    const previousDataSets = _.take(this.datasets, index);
    const previousBars = _.map(previousDataSets, (dataset) => {
      return _.pluck(dataset.data, "y");
    });
    return _.reduce(previousBars, (memo, bar) => {
      const barValue = bar[barIndex];
      const sameSign = (y < 0 && barValue < 0) || (y >= 0 && barValue >= 0);
      return sameSign ? memo + barValue : memo;
    }, 0);
  }

  getLabelIndex(x) {
    if (this.stringMap.x) {
      return (x - 1);
    } else if (this.props.categories) {
      return _.findIndex(this.props.categories, (category) => {
        return _.isArray(category) ? (_.min(category) <= x && _.max(category) >= x) :
          category === x;
      });
    } else {
      const allX = _.map(this.datasets, (dataset) => {
        return _.map(dataset.data, "x");
      });
      const uniqueX = _.uniq(_.flatten(allX));
      return (_.findIndex(_.sortBy(uniqueX), (n) => n === x));
    }
  }

  getBarPosition(data, index, barIndex) {
    const stacked = this.props.stacked;
    const yOffset = this.getYOffset(data, index, barIndex);
    const y0 = stacked ? yOffset : _.max([_.min(this.domain.y), 0]);
    const y1 = stacked ? yOffset + data.y : data.y;
    const x = this.adjustX(data.x, index, {stacked});
    return {
      independent: this.scale.x.call(this, x),
      dependent0: this.scale.y.call(this, y0),
      dependent1: this.scale.y.call(this, y1)
    };
  }

  getLabelAnchors(sign) {
    if (!this.props.horizontal) {
      return {
        vertical: sign >= 0 ? "end" : "start",
        text: "middle"
      };
    } else {
      return {
        vertical: "middle",
        text: sign >= 0 ? "start" : "end"
      };
    }
  }

  getlabelPadding(style) {
    return {
      x: this.props.horizontal ? style.padding : 0,
      y: this.props.horizontal ? 0 : style.padding
    };
  }

  renderLabel(labelData, text, data) {
    const {position, index} = labelData;
    const labelComponent = this.props.labelComponents ?
      this.props.labelComponents[index] || this.props.labelComponents[0] : undefined;
    const sign = data.y >= 0 ? 1 : -1;
    const anchors = this.getLabelAnchors(sign);
    const componentStyle = labelComponent && labelComponent.props.style;
    const style = _.merge({padding: 0}, this.style.labels, componentStyle);
    const padding = this.getlabelPadding(style);
    const children = labelComponent ? labelComponent.props.children || text : text;

    const props = {
      key: `label-${index}`,
      x: (labelComponent && labelComponent.props.x) || position.x + padding.x,
      y: (labelComponent && labelComponent.props.y) || position.y - padding.y,
      data, // Pass data for custom label component to access
      textAnchor: (labelComponent && labelComponent.props.textAnchor) || anchors.text,
      verticalAnchor: (labelComponent && labelComponent.props.textAnchor) || anchors.vertical,
      style
    };

    return labelComponent ?
      React.cloneElement(labelComponent, props, children) :
      React.createElement(VictoryLabel, props, children);
  }

  renderBars(dataset, index) {
    const isCenter = Math.floor(this.datasets.length / 2) === index;
    const isLast = this.datasets.length === index + 1;
    const stacked = this.props.stacked;
    const plotGroupLabel = (stacked && isLast) || (!stacked && isCenter);
    return _.map(dataset.data, (data, barIndex) => {
      const position = this.getBarPosition(data, index, barIndex);
      const path = position.independent ? this.getBarPath(position) : undefined;
      const styleData = _.omit(data, [
        "xName", "yName", "x", "y", "label"
      ]);
      const style = _.merge({}, this.style.data, _.omit(dataset.attrs, "name"), styleData);
      const plotLabel = (plotGroupLabel && (this.props.labels || this.props.labelComponents));

      if (plotLabel) {
        const labelPositions = {
          x: this.props.horizontal ? position.dependent1 : position.independent,
          y: this.props.horizontal ? position.independent : position.dependent1
        };
        const labelIndex = this.getLabelIndex(data.x);
        const labelData = {position: labelPositions, index: labelIndex};
        const labelText = this.props.labels ?
          this.props.labels[labelIndex] || this.props.labels[0] : "";
        return (
          <g key={`series-${index}-bar-${barIndex}`}>
            <path
              d={path}
              shapeRendering="optimizeSpeed"
              style={style}
            >
            </path>
            {this.renderLabel(labelData, labelText, data)}
          </g>
        );
      }
      return (
        <path
          d={path}
          key={`series-${index}-bar-${barIndex}`}
          shapeRendering="optimizeSpeed"
          style={style}
        >
        </path>
      );
    });
  }

  renderData() {
    return _.map(this.datasets, (dataset, index) => {
      return this.renderBars(dataset, index);
    });
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryBar` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, [
        "data", "dataAttributes", "categories", "colorScale", "domain", "height",
        "padding", "style", "width"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryBar {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    const style = this.style.parent;
    const group = <g style={style}>{this.renderData()}</g>;
    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
