#!/bin/bash

# region FirstRegion
x=42
# endregion

# region SecondRegion
function my_function {
    # region InnerRegion
    echo "Inner region"
    # endregion

    #region 
    echo "Unnamed region"
    #endregion
}
# endregion
