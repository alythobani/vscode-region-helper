#region FirstRegion
x = 42
#endregion

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
