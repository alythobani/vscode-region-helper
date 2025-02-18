package main

import "fmt"

// #region FirstRegion
var x = 42
// #endregion

// #region SecondRegion
type MyClass struct{}

// #region InnerRegion
func (m MyClass) myMethod() {}
// #endregion

// #endregion

func main() {
    fmt.Println("Sample")
}
