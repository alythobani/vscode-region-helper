//#region FirstRegion
const x = 42;
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
class MyComponent extends React.Component {
  //    #region    InnerRegion
  render() {
    return (
      <div>
        Hello <span>World</span>{" "}
      </div>
    );
  }
  //   #endregion   ends InnerRegion

  //  #region
  someMethodInUnnamedRegion() {
    return 42;
  }
  //#endregion
}
// #endregion
