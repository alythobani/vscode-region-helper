// #region FirstRegion
const x = 42;
// #endregion

/* #region SecondRegion */
class MyComponent extends React.Component {
  // #region InnerRegion
  render() {
    return (
      <div>
        Hello
        {/* #region InnerRegion */}
        <span>World</span>
        {/**  #endregion  */}
      </div>
    );
  }
  // #endregion

  // #region
  someMethodInUnnamedRegion() {
    return 42;
  }
  // #endregion
}
/** #endregion */
