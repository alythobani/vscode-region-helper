<?php
//#region FirstRegion
$x = 42;
//   #endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region Second Region
class MyClass {
    // #region   InnerRegion
    public function myMethod() {}
    //#endregion    ends InnerRegion

    // #region
    public function myMethod2() {}
    //      #endregion
}
// #endregion
?>
