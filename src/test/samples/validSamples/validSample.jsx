//#region FirstRegion
const x = 42;
//#endregion

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
