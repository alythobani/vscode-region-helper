#!/bin/bash

#region FirstRegion
x=42
#endregion

  # endregion Invalid end boundary
  # region Invalid start boundary

#   region Second Region
function my_function {
    #  region   InnerRegion
    echo "Inner region"
    #endregion    ends InnerRegion

    #region 
    echo "Unnamed region"
    #     endregion
}
# endregion
