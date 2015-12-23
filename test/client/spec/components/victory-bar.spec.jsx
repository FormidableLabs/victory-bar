/**
 * Client tests
 */
import React from "react";
import ReactDOM from "react-dom";
import VictoryBar from "src/components/victory-bar";
// Use `TestUtils` to inject into DOM, simulate events, etc.
// See: https://facebook.github.io/react/docs/test-utils.html
import TestUtils from "react-addons-test-utils";

const getElement = function (output, tagName) {
  return ReactDOM.findDOMNode(
    TestUtils.findRenderedDOMComponentWithTag(output, tagName)
  );
};

let renderedComponent;

describe("components/victory-bar", () => {
  describe("default component rendering", () => {
    before(() => {
      renderedComponent = TestUtils.renderIntoDocument(<VictoryBar/>);
    });

    it("renders an svg with the correct width and height", () => {

      const svg = getElement(renderedComponent, "svg");
      // default width and height
      expect(svg.style.width).to.equal(`${VictoryBar.defaultProps.width}px`);
      expect(svg.style.height).to.equal(`${VictoryBar.defaultProps.height}px`);
    });
  });

  describe("domain calculation", () => {
    it("calculates the correct domain", () => {
      const data = [
        [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}]
      ];
      const component = TestUtils.renderIntoDocument(
        <VictoryBar data={data} domainPadding={0}/>
      );
      expect(component.domain.y).to.deep.equal([0, 2]);
      expect(component.domain.x).to.deep.equal([1, 3]);
    });

    it("calculates the correct domain with negative data", () => {
      const data = [
        [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: -2}]
      ];
      const component = TestUtils.renderIntoDocument(
        <VictoryBar data={data} domainPadding={0}/>
      );
      expect(component.domain.y).to.deep.equal([-2, 2]);
      expect(component.domain.x).to.deep.equal([1, 3]);
    });

    it("calculates a cumulative domain for stacked data", () => {
      const data = [
        [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}]
      ];
      const component = TestUtils.renderIntoDocument(
        <VictoryBar stacked data={data} domainPadding={0}/>
      );
      expect(component.domain.y).to.deep.equal([0, 3]);
    });

    it("calculates a cumulative domain with negative and positive data", () => {
      const data = [
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
        [{x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}],
        [{x: 1, y: -1}, {x: 2, y: -1}, {x: 3, y: -1}],
        [{x: 1, y: -2}, {x: 2, y: -2}, {x: 3, y: -2}]
      ];
      const component = TestUtils.renderIntoDocument(
        <VictoryBar stacked data={data} domainPadding={0}/>
      );
      expect(component.domain.y).to.deep.equal([-3, 4]);
    });
  });
});
