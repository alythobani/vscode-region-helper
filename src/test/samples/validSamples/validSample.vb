#Region "FirstRegion"
Dim x As Integer = 42
#End Region

#Region "Second Region"
Public Class MyClass
    #Region    "InnerRegion"    
    Public Sub MyMethod()
    End Sub
    #End Region        ends InnerRegion     

    #Region
    Public Sub MyMethod2()
    End Sub
    #End Region
End Class
#End Region
