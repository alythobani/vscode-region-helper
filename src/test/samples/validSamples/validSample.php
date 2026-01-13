<?php
//#region FirstRegion
$x = 42;
//   #endregion

#region Second Region
class MyClass {
    /* #region   InnerRegion */
    public function myMethod() {}
    /* #endregion    ends InnerRegion */

    // #region
    public function myMethod2() {}
    //      #endregion
}
#endregion
?>
