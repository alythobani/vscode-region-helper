#include <iostream>

//#region FirstRegion
int x = 42;
//#endregion

// #region SecondRegion
class MyClass {
    //  #region    InnerRegion    
    void myMethod() {}
    //   #endregion    ends InnerRegion  

    // #region
    void myMethod2() {}
    //#endregion
};
//  #endregion
