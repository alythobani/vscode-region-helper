// #region FirstRegion
int x = 42;
// #endregion

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
