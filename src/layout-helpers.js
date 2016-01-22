import flatten from "lodash/array/flatten";
import take from "lodash/array/take";
import uniq from "lodash/array/uniq";
import isDate from "lodash/lang/isDate";
import merge from "lodash/object/merge";
import omit from "lodash/object/omit";

module.exports = {
  // Layout Helpers
  getBarPosition(datum, index, calculatedProps) {
    const { scale, stacked, categories } = calculatedProps;
    const yOffset = stacked ? this.getYOffset(datum, index, calculatedProps) : 0;
    const y0 = yOffset;
    const y1 = yOffset + datum.y;
    const x = (stacked && !categories) ? datum.x:
      this.adjustX(datum, index.seriesIndex, calculatedProps);
    const formatValue = (value, axis) => {
      return isDate(datum[axis]) ? new Date(value) : value;
    };
    return {
      independent: scale.x(formatValue(x, "x")),
      dependent0: scale.y(formatValue(y0, "y")),
      dependent1: scale.y(formatValue(y1, "y"))
    };
  },

  getYOffset(datum, index, calculatedProps) {
    const { datasets } = calculatedProps;
    if (index.seriesIndex === 0) {
      return 0;
    }
    const y = datum.y;
    const previousDataSets = take(datasets, index.seriesIndex);
    const previousBars = previousDataSets.map((dataset) => {
      return dataset.data.map((previousDatum) => datum.y);
    });
    return previousBars.reduce((memo, bar) => {
      const barValue = bar[index.barIndex];
      const sameSign = (y < 0 && barValue < 0) || (y >= 0 && barValue >= 0);
      return sameSign ? memo + barValue : memo;
    }, 0);
  },

  adjustX(datum, index, calculatedProps) {
    const {stacked, categories} = calculatedProps;
    const style = calculatedProps.style.data;
    const x = datum.x;
    const datasets = calculatedProps.datasets;
    const center = datasets.length % 2 === 0 ?
      datasets.length / 2 : (datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this.pixelsToValue(style.padding, "x", calculatedProps) +
      this.pixelsToValue(style.width, "x", calculatedProps);
    if (datum.category !== undefined) {
      // if this is category data, shift x to the center of its category
      const rangeBand = categories[datum.category];
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
    const labelExists = (props.labels || props.labelComponents) ? true : false;
    return (plotGroupLabel && labelExists);
  },

  getLabelIndex(datum, calculatedProps) {
    const { datasets, stringMap } = calculatedProps;
    if (datum.category !== undefined) {
      return datum.category;
    } else if (stringMap.x) {
      return (datum.x - 1);
    } else {
      const allX = datasets.map((dataset) => {
        return dataset.data.map(d => d.x);
      });
      const uniqueX = uniq(flatten(allX));
      return (uniqueX.sort()).findIndex((x) => x === datum.x);
    }
  },

  getBarStyle(datum, dataset, baseStyle) {
    const styleData = omit(datum, [
      "xName", "yName", "x", "y", "label", "category"
    ]);
    return merge({}, baseStyle.data, omit(dataset.attrs, "name"), styleData);
  }
};
