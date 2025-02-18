#region FirstRegion
x = 42
#endregion

# region SecondRegion
class MyClass:
    #  region InnerRegion
    def method(self):
        pass
    #          endregion

    #region
    def method2(self):
        pass
    # endregion

# endregion
