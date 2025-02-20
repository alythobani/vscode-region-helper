-- #region FirstRegion
x = 42
-- #endregion

-- #endregion Invalid end boundary
-- #region Invalid start boundary

-- #region Second Region  
data MyClass = MyClass
    --    #region   InnerRegion  
  deriving Show
    --         #endregion    ends InnerRegion  

  --  #region  
deriving UnnamedRegion
--  #endregion  
-- #endregion

