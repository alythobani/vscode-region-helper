#region FirstRegion
x <- 42
#endregion

# region Second Region
my_function <- function() {
  #region      InnerRegion
  print("Hello")
  #endregion      ends InnerRegion

 #   region
 print("Unnamed region")
    #endregion
}
# endregion
