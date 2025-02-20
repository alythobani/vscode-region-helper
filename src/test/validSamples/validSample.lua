--#region FirstRegion
local x = 42
--#endregion

-- #endregion Invalid end boundary
-- #region Invalid start boundary

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
