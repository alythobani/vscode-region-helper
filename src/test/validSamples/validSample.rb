#region FirstRegion
x = 42
#endregion
 
  # endregion Invalid end boundary
  # region Invalid start boundary

#   region Second Region
class MyClass
    #  region    InnerRegion
    def my_method
    end
    # endregion   ends InnerRegion

    #region
    def my_method2
    end
    #   endregion
end
# endregion
