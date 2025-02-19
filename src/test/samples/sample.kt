fun main() {
    // #region FirstRegion
    val x = 42
    //#endregion

    //#region SecondRegion  
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
