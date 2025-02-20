#region FirstRegion
x = 42
#endregion

  # endregion Invalid end boundary
  # region Invalid start boundary

# region Second Region  
struct MyClass
  #  region    InnerRegion   
  function method()
    println("Hello")
  end
  #  endregion    ends InnerRegion

    #region
    function method2()
      println("Unnamed region")
    end
    #   endregion
end
# endregion  
