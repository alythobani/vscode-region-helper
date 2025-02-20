//#region FirstRegion
const x = 42;
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
class MyClass {
  //    #region   InnerRegion
  method() {}
  //      #endregion   ends InnerRegion

  // #region
  anotherMethod() {}
  //#endregion
}

//  #endregion
