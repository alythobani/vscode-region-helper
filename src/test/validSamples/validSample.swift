import Foundation

//#region FirstRegion
let x = 42
//#endregion

//  #region Second Region
class MyClass {
    // #region     InnerRegion
    func myMethod() {}
    //   #endregion   ends InnerRegion

    // #region     
    func myMethod2() {}
    // #endregion   
}
//   #endregion
