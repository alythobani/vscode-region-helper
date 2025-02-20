package main

import "fmt"

//#region FirstRegion
var x = 42
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

// #region      Second Region
type MyClass struct{}

// #region InnerRegion
func (m MyClass) myMethod() {}
        //        #endregion ends InnerRegion

        // #region
func (m MyClass) myMethod2() {}
//#endregion

// #endregion

func main() {
    fmt.Println("Sample")
}
