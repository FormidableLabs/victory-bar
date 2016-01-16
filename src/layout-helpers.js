import flatten from "lodash/array/flatten";
import take from "lodash/array/take";
import uniq from "lodash/array/uniq";
import isDate from "lodash/lang/isDate";
import merge from "lodash/object/merge";
import omit from "lodash/object/omit";

module.exports = {
  // Layout Helpers
  getBarPosition(data, index, calculatedProps) {
    const { scale, stacked, categories, datasets } = calculatedProps;
    const yOffset = stacked ? this.getYOffset(data, index, datasets) : 0;
    const y0 = yOffset;
    const y1 = yOffset + data.y;
    const x = (stacked && !categories) ? data.x :
      this.adjustX(data, index.seriesIndex, calculatedProps);
    const formatValue = (value, axis) => {
      return isDate(data[axis]) ? new Date(value) : value;
    };
    return {
      independent: scale.x.call(null, formatValue(x, "x")),
      dependent0: scale.y.call(null, formatValue(y0, "y")),
      dependent1: scale.y.call(null, formatValue(y1, "y"))
    };
  },

  getYOffset(data, index, datasets) {
    if (index.seriesIndex === 0) {
      return 0;
    }
    const y = data.y;
    const previousDataSets = take(datasets, index.seriesIndex);
    const previousBars = previousDataSets.map((dataset) => {
      return dataset.data.map((datum) => datum.y);
    });
    return previousBars.reduce((memo, bar) => {
      const barValue = bar[index.barIndex];
      const sameSign = (y < 0 && barValue < 0) || (y >= 0 && barValue >= 0);
      return sameSign ? memo + barValue : memo;
    }, 0);
  },

  adjustX(data, index, calculatedProps) {
    const style = calculatedProps.style.data;
    const {stacked, categories} = calculatedProps;
    const x = data.x;
    const datasets = calculatedProps.datasets;
    const center = datasets.length % 2 === 0 ?
      datasets.length / 2 : (datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this.pixelsToValue(style.padding, "x", calculatedProps) +
      this.pixelsToValue(style.width, "x", calculatedProps);
    if (data.category !== undefined) {
      // if this is category data, shift x to the center of its category
      const rangeBand = categories[data.category];
      const bandCenter = (Math.max(...rangeBand) + Math.min(...rangeBand)) / 2;
      return stacked ? bandCenter : bandCenter + (centerOffset * totalWidth);
    }
    return stacked ? x : x + (centerOffset * totalWidth);
  },

  pixelsToValue(pixels, axis, calculatedProps) {
    if (pixels === 0) {
      return 0;
    }
    const domain = calculatedProps.domain[axis];
    const range = calculatedProps.range[axis];
    const domainExtent = Math.max(...domain) - Math.min(...domain);
    const rangeExtent = Math.max(...range) - Math.min(...range);
    return domainExtent / rangeExtent * pixels;
  },

  // Label Helpers
  shouldPlotLabel(index, props, datasets) {
    const isCenter = Math.floor(datasets.length / 2) === index;
    const isLast = datasets.length === index + 1;
    const stacked = props.stacked;
    const plotGroupLabel = (stacked && isLast) || (!stacked && isCenter);
    return (plotGroupLabel && (props.labels || props.labelComponents));
  },

  getLabelIndex(data, calculatedProps) {
    const { datasets, stringMap } = calculatedProps;
    if (data.category !== undefined) {
      return data.category;
    } else if (stringMap.x) {
      return (data.x - 1);
    } else {
      const allX = datasets.map((dataset) => {
        return dataset.data.map((datum) => datum.x);
      });
      const uniqueX = uniq(flatten(allX));
      return (uniqueX.sort()).findIndex((n) => n === data.x);
    }
  },

  getBarStyle(data, dataset, baseStyle) {
    const styleData = omit(data, [
      "xName", "yName", "x", "y", "label", "category"
    ]);
    return merge({}, baseStyle.data, omit(dataset.attrs, "name"), styleData);
  }
};
