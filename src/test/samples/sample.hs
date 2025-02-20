-- #region FirstRegion
x = 42
-- #endregion

-- #region Second Region  
data MyClass = MyClass
    --    #region   InnerRegion  
  deriving Show
    --         #endregion    ends InnerRegion  

  --  #region  
deriving UnnamedRegion
--  #endregion  
-- #endregion

