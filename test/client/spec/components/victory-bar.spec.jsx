/**
 * Client tests
 */
import React from "react";
import ReactDOM from "react-dom";
import VictoryBar from "src/components/victory-bar";
// Use `TestUtils` to inject into DOM, simulate events, etc.
// See: https://facebook.github.io/react/docs/test-utils.html
import TestUtils from "react-addons-test-utils";
import { Surface } from "react-art";

describe("components/victory-bar", () => {
  describe("default component rendering", () => {
    it("renders a Surface component with the default width and height", () => {
      const renderer = TestUtils.createRenderer();
      renderer.render(<VictoryBar/>);
      const output = renderer.getRenderOutput();
      expect(output.type).to.equal(Surface);
      // default width and height
      expect(output.props.width).to.equal(VictoryBar.defaultProps.width);
      expect(output.props.height).to.equal(VictoryBar.defaultProps.height);
    });
  });
});
