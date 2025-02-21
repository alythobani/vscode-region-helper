#region FirstRegion
x = 42
#endregion

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
