[![Travis Status][trav_img]][trav_site]

VictoryBar
=============
VictoryBar creates a set of bars from data. Bar is a composable component, so it does not include an axis.  Check out VictoryChart for easy to use bar charts and more.

## API

There are several configuration options for Victory Bar, but if only the `data`is prop is provided, a sensible bar chart will still be rendered.

### Props

All props are optional, but you wont get very far without passing in some data.

#### data

The data prop specifies the data to be plotted. Data should be in the form of an array of data points, or an array of arrays of data points for multiple datasets. Each data point should be an object with x and y properties. Other properties may be added to the data point object, such as color, and opacity. These properties will be interpreted and applied to the individual bar.

examples:

```
data={[
  {x: new Date(1982, 1, 1), y: 125, color: "red"},
  {x: new Date(1987, 1, 1), y: 257, color: "blue"},
  {x: new Date(1993, 1, 1), y: 345, color: "green"}
]}

data={[
  [{x: 5, y: 3}, {x: 4, y: 2}, {x: 3, y: 1}],
  [{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}],
  [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}]
]}
```

### dataAttributes

The dataAttributes prop describes how a data set should be styled.
This prop can be given as an object, or an array of objects. If this prop is
given as an array of objects, the properties of each object in the array will
be applied to the data points in the corresponding array of the data prop.

examples:

```
dataAttributes={{color: "blue", opacity: 0.8}}

dataAttributes={[
  {color: "green"}, 
  {color: "orange", opacity: 0.4}
]}

```
 
### scale

The scale prop determines which scales your bar chart should use. This prop can be given as a function, or as an object that specifies separate functions for x and y. Supported scales are d3 linear scales, time scales, power scales, and log scales. d3 ordinal scales are not supported, but non-numeric data is automatically handled and range band like behavior is supported via the `categories` prop.

examples:

```
scale={() => d3.time.scale()}

scale={{x: () => d3.scale.linear(), y: () => d3.scale.log()}}
```

### domain

The domain prop describes the range of values your bar chart will include. This prop can be given as a array of the minimum and maximum expected values for your chart, or as an object that specifies separate arrays for x and y.
If this prop is not provided, a domain will be calculated from data, or other available information.

examples:

```
domain={[-1, 1]}

domain={{x: [0, 100], y: [0, 1]}}
```

### range

The range prop describes the range of pixels your ber chart will cover. This prop can begiven as a array of the minimum and maximum expected values for your chart, or as an object that specifies separate arrays for x and y.
If this prop is not provided, a range will be calculated based on the height,
width, and margin provided in the style prop, or in default styles. It is usually a good idea to let the bar component calculate its own range.

examples:

```
range={[0, 500]} 

range={{x: [0, 500], y: [500, 300]}}
```

### containerElement

The containerElement prop specifies which element the compnent will render.
For standalone bar components, the containerElement prop should be "svg". If you need to compose bar with other chart components , the containerElement prop should be "g", and will need to be rendered within an svg tag.

### style

The style prop specifies styles for your chart. VictoryBar relies on Radium,
so valid Radium style objects should work for this prop, however height, width, and margin are used to calculate range, and need to be expressed as a number of pixels

example:

```
style={{color: "red", width: 500, height: 300}}
```

### barWidth

The barWidth prop specifies the width in number of pixels for bars rendered in the bar chart.

### barPadding

The barPadding prop specifies the padding in number of pixels between bars
rendered in the bar chart.

### domainPadding

The domainPadding prop specifies a number of pixels of padding to add to the beginning and end of a domain. This prop is useful for explicitly spacing groups of bars farther from the origin to prevent crowding. This prop should be given as an object with numbers specified for x and y.

example: `{x: 20, y: 0}`

### categories

The categories prop specifies the categories for a bar chart. This prop should be given as an array of string values, numeric values, or arrays. When this prop is given as an array of arrays, the minimum and maximum values of the arrays define range bands, allowing numeric data to be grouped into segments.

examples:

```
categories={["dogs", "cats", "mice"]}

categories={[
  [0, 5], 
  [5, 10], 
  [10, 15]
]}
```

### animate
The animate prop determines whether the chart should animate with changing data.

## Development

Please see [DEVELOPMENT](DEVELOPMENT.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md)

[trav_img]: https://api.travis-ci.org/FormidableLabs/victory-bar.svg
[trav_site]: https://travis-ci.org/FormidableLabs/victory-bar

