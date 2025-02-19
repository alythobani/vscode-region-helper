//#region FirstRegion
const x = 42;
//#endregion

// #region SecondRegion
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
