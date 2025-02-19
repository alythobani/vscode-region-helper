-- #region FirstRegion
x = 42
-- #endregion

-- #region SecondRegion  
data MyClass = MyClass
    --    #region   InnerRegion  
  deriving Show
    --         #endregion    ends InnerRegion  

  --  #region  
deriving UnnamedRegion
--  #endregion  
-- #endregion

