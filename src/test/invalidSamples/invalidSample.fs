//#region   FirstRegion
let x = 42
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
type MyClass() =
    // #region InnerRegion
    member this.MyMethod() = ()
    // #endregion ends InnerRegion

    // #region
    member this.MyOtherMethod() = ()
    //        #endregion
// #endregion

