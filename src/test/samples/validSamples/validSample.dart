//#region FirstRegion
int x = 42;
// #endregion

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

