/**
 * Client tests
 */
/*eslint-disable max-nested-callbacks */

import React from "react";
// import _ from "lodash";
import VictoryBar from "src/components/victory-bar";
// import DomainHelpers from "src/domain-helpers";
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

  // describe("rendering data", () => {
  //   let renderedComponent;
  //   it("renders bars for {x, y} shaped data (default)", () => {
  //     const data = _.range(10).map((i) => ({x: i, y: i}));
  //     renderedComponent = TestUtils.renderIntoDocument(<VictoryBar data={data}/>);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "Shape");
  //     expect(path.length).to.equal(10);
  //   });
  //
  //   it("renders bars for array-shaped data", () => {
  //     const data = _.range(20).map((i) => [i, i]);
  //     renderedComponent = TestUtils.renderIntoDocument(<VictoryBar data={data} x={0} y={1}/>);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(20);
  //   });
  //
  //   it("renders bars for deeply-nested data", () => {
  //     const data = _.range(40).map((i) => ({a: {b: [{x: i, y: i}]}}));
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryBar data={data} x="a.b[0].x" y="a.b[0].y"/>
  //     );
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(40);
  //   });
  //
  //   it("renders bars values with null accessor", () => {
  //     const data = _.range(30);
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryBar data={data} x={null} y={null}/>
  //     );
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(30);
  //   });
  // });
  //
  // describe("rendering multiple datasets", () => {
  //   let sandbox;
  //   let renderedComponent;
  //   beforeEach(() => {
  //     sandbox = sinon.sandbox.create();
  //     sandbox.spy(DomainHelpers, "isStacked");
  //     sandbox.spy(DomainHelpers, "shouldGroup");
  //   });
  //
  //   afterEach(() => {
  //     sandbox.restore();
  //   });
  //
  //   it("renders grouped bars if grouped prop is true", () => {
  //     const datasets = _.range(3).map(() => _.range(10).map((i) => ({x: i, y: i})));
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryBar grouped data={datasets}/>
  //     );
  //     expect(DomainHelpers.shouldGroup).called.and.returned(true);
  //     expect(DomainHelpers.isStacked).called.and.returned(false);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(30);
  //   });
  //
  //   it("renders stacked bars if stacked prop is true", () => {
  //     const datasets = _.range(4).map(() => _.range(10).map((i) => ({x: i, y: i})));
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryBar stacked data={datasets}/>
  //     );
  //     expect(DomainHelpers.shouldGroup).called.and.returned(false);
  //     expect(DomainHelpers.isStacked).called.and.returned(true);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(40);
  //   });
  //
  //   it("renders grouped if grouped is undefined, data is 2d array, & default accessors", () => {
  //     const datasets = _.range(5).map(() => _.range(10).map((i) => ({x: i, y: i})));
  //     renderedComponent = TestUtils.renderIntoDocument(<VictoryBar data={datasets}/>);
  //     expect(DomainHelpers.shouldGroup).called.and.returned(true);
  //     expect(DomainHelpers.isStacked).called.and.returned(false);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(50);
  //   });
  // });
});
