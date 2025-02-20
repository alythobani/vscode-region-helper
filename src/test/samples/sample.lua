--#region FirstRegion
local x = 42
--#endregion

-- #region Second Region  
MyClass = {}
function MyClass:method()
    --    #region   InnerRegion  
  print("Hello")
    --         #endregion    ends InnerRegion  

  --  #region  
    print("Unnamed region")
--#endregion  
end
-- #endregion
