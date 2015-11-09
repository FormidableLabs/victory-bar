Victory Bar
=============

`victory-bar` draws an SVG bar chart with [React](https://github.com/facebook/react). Styles and data can be customized by passing in your own values as properties to the component. Data changes are animated with [victory-animation](https://github.com/FormidableLabs/victory-animation).

## Examples

The plain component has baked-in sample data, style, and angle defaults, so even when no props are specified, an example pie chart will be rendered:

``` playground
<VictoryBar/>
```

Labels can be created either by passing in strings in an array to the prop `labels`, or by passing in entire components in an array to the prop `labelComponents`. Used together, the text in `labels` will be applied to components in `labelComponents`.

``` playground
<VictoryBar
  labels={[
    "zero",
    "one",
    "two",
    "three"
  ]}
  labelComponents={[
    <VictoryLabel textAnchor={"middle"} verticalAnchor={"end"}>
    </VictoryLabel>
  ]}/>
```

Styles of the data and the bar chart itself can also be specified:

``` playground
<VictoryBar 
  style={{
    data: {
      width: 15,
      fill: "orange"
    }, 
    parent: {
      width: 300,
      height: 300
  }}}/>
```

And styles and other attributes of the data can be defined as well, with the `dataAttributes` prop. If `dataAttributes` is an object, the attributes will be applied to all bars in the chart. If it is an array of objects, each object of attributes will be applied to each bar in the chart in turn.

``` playground
<VictoryBar
  dataAttributes={{fill: "red"}}/>
```


Set the `horizontal` prop to create a horizontal bar chart. Label positions will automatically adjust. Note that the x variable in the data remains the independent variable and is now linked to the vertical axis.

``` playground
<VictoryBar horizontal
  style={{
    labels: {
      fontSize: 10
    }, 
    parent: {
      width: 400,
      height: 400
  }}}/>
```



