import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryLabel } from "victory-label";
import { VictoryAnimation } from "victory-animation";

@Radium
export default class BarLabel extends React.Component {

  static propTypes = {
    animate: PropTypes.object,
    position: PropTypes.object,
    horizontal: PropTypes.bool,
    style: PropTypes.object,
    data: PropTypes.object,
    labelText: PropTypes.string,
    labelComponent: PropTypes.any
  };

  getCalculatedValues(props) {
    this.anchors = this.getLabelAnchors(props);
    this.position = {
      x: props.horizontal ? props.position.dependent1 : props.position.independent,
      y: props.horizontal ? props.position.independent : props.position.dependent1
    };
  }

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = _.isFunction(value) ? value.call(this, this.props.data) : value;
    });
  }

  getLabelAnchors(props) {
    const sign = props.data.y >= 0 ? 1 : -1;
    if (!props.horizontal) {
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

  renderLabelComponent(props) {
    const component = props.labelComponent;
    const style = this.evaluateStyle(_.merge({padding: 0}, props.style, component.props.style));
    const padding = this.getlabelPadding(style);
    const children = component.props.children || props.labelText;
    const newProps = {
      x: component.props.x || this.position.x + padding.x,
      y: component.props.y || this.position.y - padding.y,
      data: props.data, // Pass data for custom label component to access
      textAnchor: component.props.textAnchor || this.anchors.text,
      verticalAnchor: component.props.verticalAnchor || this.anchors.vertical,
      style
    };
    return React.cloneElement(component, newProps, children);
  }

  renderVictoryLabel(props) {
    const style = this.evaluateStyle(_.merge({padding: 0}, props.style));
    const padding = this.getlabelPadding(style);
    return (
      <VictoryLabel
        x={this.position.x + padding.x}
        y={this.position.y - padding.y}
        data={props.data}
        textAnchor={this.anchors.text}
        verticalAnchor={this.anchors.vertical}
        style={style}
      >
        {props.labelText}
      </VictoryLabel>
    );
  }

  renderLabel(props) {
    return props.labelComponent ?
      this.renderLabelComponent(props) : this.renderVictoryLabel(props);
  }

  render() {
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["position", "style", "data"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <BarLabel {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    return (
      <g>
        {this.renderLabel(this.props)}
      </g>
    );
  }
}
