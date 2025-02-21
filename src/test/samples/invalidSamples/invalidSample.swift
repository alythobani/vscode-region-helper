import Foundation

//#region FirstRegion
let x = 42
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

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
