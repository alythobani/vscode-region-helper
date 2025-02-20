--#region FirstRegion
SELECT * FROM users;
--#endregion

-- #endregion Invalid end boundary
-- #region Invalid start boundary

-- #region Second Region  
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100)
    --    #region   InnerRegion  
    -- This region contains example constraints
    CHECK (LENGTH(name) > 0)
    --         #endregion    ends InnerRegion  
);

-- #region  
-- This is an unnamed region example
DROP TABLE IF EXISTS temp_table;
--#endregion  

-- #endregion
