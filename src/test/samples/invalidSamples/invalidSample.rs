fn main() {
    // #region FirstRegion
    let x = 42;
    //#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

    //    #region Second Region
    struct MyClass;

    impl MyClass {
        // #region InnerRegion
        fn my_method(&self) {}
        //   #endregion   ends InnerRegion

        // #region
        fn my_method2(&self) {}
        //#endregion
    }
    //  #endregion
}
