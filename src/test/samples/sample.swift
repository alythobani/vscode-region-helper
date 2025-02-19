import Foundation

//#region FirstRegion
let x = 42
//#endregion

//  #region SecondRegion
class MyClass {
    // #region     InnerRegion
    func myMethod() {}
    //   #endregion   ends InnerRegion

    // #region     
    func myMethod2() {}
    // #endregion   
}
//   #endregion
