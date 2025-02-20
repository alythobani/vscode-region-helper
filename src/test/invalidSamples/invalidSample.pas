//#region FirstRegion
program HelloWorld;
begin
  writeln('Hello, World!');
end.
// #endregion

(*#endregion Invalid end boundary*)
{#region Invalid start boundary}

{  #region    Second Region  }
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
