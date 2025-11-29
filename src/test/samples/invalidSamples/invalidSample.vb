#Region "FirstRegion"
Dim x As Integer = 42
#End Region

#End Region
#Region "Invalid start boundary"

#Region "Second Region"
Public Class MyClass
    #Region "InnerRegion"
    Public Sub MyMethod()
    End Sub
    #End Region

    #Region
    Public Sub MyMethod2()
    End Sub
    #End Region
End Class
#End Region
