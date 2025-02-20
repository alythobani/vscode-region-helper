#region FirstRegion
my $x = 42;
#endregion

#  region Second Region
sub my_function {
  #  region    InnerRegion    
  print "Hello, World!\n";
  #  endregion   ends InnerRegion  

  #region
  my $y = 24;
  #endregion
}
#  endregion
