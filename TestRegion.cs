using System;

// #region Test1
public class TestRegion
{
    public void TestMethodOne()
    {
        Console.WriteLine("This is Test Method One");
    }
}
// #endregion

public class AnotherTestRegion
{
    #region Test2
    public void TestMethodTwo()
    {
        // #region InnerTest
        Console.WriteLine("This is Test Method Two");
        // #endregion
    }
    #endregion
}

