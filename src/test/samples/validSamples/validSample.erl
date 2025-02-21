%   #region FirstRegion
X = 42.
   %%         #endregion

% #region Second Region
-module(my_class).
-export([my_method/0]).

%#region  InnerRegion  
my_method() -> ok.
  %%   #endregion ends InnerRegion  

% #region
method_in_unnamed_region() -> ok.
%%%#endregion

%#endregion
