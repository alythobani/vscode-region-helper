#region FirstRegion
x <- 42
#endregion

# region SecondRegion
my_function <- function() {
  #region InnerRegion
  print("Hello")
  #endregion

 #   region
 print("Unnamed region")
    #endregion
}
# endregion
