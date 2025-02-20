fun main() {
    // #region FirstRegion
    val x = 42
    //#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

    //#region Second Region  
    class MyClass {
        // #region   InnerRegion   
        fun myMethod() {}
        //  #endregion   ends InnerRegion 

        // #region
        fun myMethod2() {}
               //#endregion 
    }
    // #endregion
}
