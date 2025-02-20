#include <iostream>

//#region FirstRegion
int x = 42;
//#endregion

// #region Second Region
class MyClass {
    //  #region    InnerRegion    
    void myMethod() {}
    //   #endregion    ends InnerRegion  

    // #region
    void myMethod2() {}
    //#endregion
};
//  #endregion
