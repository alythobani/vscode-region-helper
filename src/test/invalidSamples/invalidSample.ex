#region FirstRegion
x = 42
#endregion

  # endregion Invalid end boundary
  # region Invalid start boundary

# region Second Region
defmodule MyClass do
  #  region   InnerRegion
  def my_method do
  end
  #   endregion   ends InnerRegion

  #region
  def my_method2 do
  end
    #     endregion
end
#  endregion
