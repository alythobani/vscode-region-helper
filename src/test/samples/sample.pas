//#region FirstRegion
program HelloWorld;
begin
  writeln('Hello, World!');
end.
// #endregion

{  #region    SecondRegion  }
procedure MyProcedure;
begin
  (*    #region    InnerRegion    *)
  writeln('Inside region');
  (*  #endregion   ends InnerRegion  *)

  {#region}
  writeln('Another unnamed region');
  {#endregion}
end;
{   #endregion   }
