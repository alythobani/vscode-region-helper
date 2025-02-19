#region FirstRegion
x = 42
#endregion

#   region SecondRegion
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
