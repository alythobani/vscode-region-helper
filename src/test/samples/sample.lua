--#region FirstRegion
local x = 42
--#endregion

-- #region SecondRegion  
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
