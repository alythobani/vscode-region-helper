#region FirstRegion
x = 42
#endregion
 
  # endregion Invalid end boundary
  # region Invalid start boundary

# region Second Region
class MyClass:
    #  region    InnerRegion    
    def method(self):
        pass
    #          endregion   ends InnerRegion   

    #region
    def method2(self):
        pass
    # endregion

# endregion
