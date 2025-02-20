// #region FirstRegion
int x = 42;
// #endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
class MyClass {
    //  #region InnerRegion  
    void MyMethod() {}
    //#endregion   ends  InnerRegion 

    // #region
    void MyMethod2() {}
    //    #endregion  
}
// #endregion
