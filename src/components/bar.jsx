import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import { VictoryAnimation } from "victory-animation";

@Radium
export default class Bar extends React.Component {

  static propTypes = {
    animate: PropTypes.object,
    position: PropTypes.object,
    horizontal: PropTypes.bool,
    style: PropTypes.object,
    data: PropTypes.object
  };

  getCalculatedValues(props) {
    this.style = this.evaluateStyle(props.style);
    this.barWidth = this.style.width;
    this.path = props.position.independent ? this.getBarPath(props.position) : undefined;
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

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = _.isFunction(value) ? value.call(this, this.props.data) : value;
    });
  }

  renderBar() {
    return (
      <path
        d={this.path}
        style={this.style}
        shapeRendering="optimizeSpeed"
      />
    );
  }

  render() {
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["position", "style", "data"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <Bar {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    return (
      <g>
        {this.renderBar()}
      </g>
    );
  }
}
