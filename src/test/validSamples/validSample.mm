//#region FirstRegion
#import <iostream>
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

//  #region Second Region
class MyClass {
  //  #region    InnerRegion  
  void myMethod() {
    std::cout << "Hello, World!" << std::endl;
  }
  //  #endregion  ends InnerRegion  

  //  #region
  int value;
  // #endregion
};
//  #endregion
