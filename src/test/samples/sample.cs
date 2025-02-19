// #region FirstRegion
int x = 42;
// #endregion

// #region SecondRegion
class MyClass {
    //  #region InnerRegion  
    void MyMethod() {}
    //#endregion   ends  InnerRegion 

    // #region
    void MyMethod2() {}
    //    #endregion  
}
// #endregion
