<!--#region FirstRegion-->
<script>
  let x = 42;
</script>
<!--#endregion-->

<!-- #endregion Invalid end boundary -->
<!-- #region Invalid start boundary -->

<!--   #region Second Region -->
<div>
  <!--  #region    InnerRegion   -->
  <p>Hello, World!</p>
  <!--  #endregion   ends InnerRegion   -->

  <!-- #region -->
  <span>Another unnamed region</span>
  <!-- #endregion -->
</div>
<!--   #endregion -->
