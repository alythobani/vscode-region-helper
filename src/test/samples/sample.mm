//#region FirstRegion
#import <iostream>
//#endregion

//  #region SecondRegion
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
