fun main() {
    // #region FirstRegion
    val x = 42
    //#endregion

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
