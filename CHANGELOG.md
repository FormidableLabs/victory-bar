# Victory Changelog

## 4.0.0

- Supports data accessor functions!
[more detail](https://github.com/FormidableLabs/victory/issues/84)

## 3.0.0 (2016-01-15)

- Upgrade to Radium 0.16.2. This is a breaking change if you're using media queries or keyframes in your components. Please review upgrade guide at https://github.com/FormidableLabs/radium/blob/master/docs/guides/upgrade-v0.16.x.md
- Demo application now works with hot reloading.
- Application dependencies like `radium` and `lodash` now live in components, not in the Builder archetype. This is a breaking change. https://github.com/FormidableLabs/victory/issues/176


## 2.6.1 (2016-1-19)

- Extracted shared code into `victory-util`
- The domain for the dependent axis now includes zero by default [issue](https://github.com/FormidableLabs/victory-bar/issues/75)
- Removes automatic alphabetic sorting on string data [issue](https://github.com/FormidableLabs/victory-bar/issues/66)
- Supports labels on individual bars
[issue](https://github.com/FormidableLabs/victory-bar/issues/81)
- Increased unit test coverage to ~75%

## 2.5.1 (2015-12-30)

- Fixed a bug that was causing the cumulative max on stacked bar charts to be overestimated
- Fixed a bug related to date formatting in Firefox

## 2.5.0 Alpha (2015-12-16)

Functional styles for data (each bar) and labels. Styles may be given as a function of `data`,
where `data` is each data object in the array provided to `props.data`

Components use d3-modules

Basic code coverage

We make no promises about any code prior to this release.
