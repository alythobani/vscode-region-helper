//#region   FirstRegion
let x = 42
//#endregion

// #region Second Region
type MyClass() =
    // #region InnerRegion
    member this.MyMethod() = ()
    // #endregion ends InnerRegion

    // #region
    member this.MyOtherMethod() = ()
    //        #endregion
// #endregion

#region NativeRegion
type NativeClass() =
    #region InnerNativeRegion
    member this.NativeMethod() = ()
    #endregion
#endregion

