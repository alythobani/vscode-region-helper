//#region FirstRegion
int x = 42;
// #endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
class MyClass {
  // #region InnerRegion
  void myMethod() {}
  //#endregion

//   #region
    void myMethod2() {}
  //      #endregion ends unnamed region
}
// #endregion

