fn main() {
    // #region FirstRegion
    let x = 42;
    //#endregion

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
