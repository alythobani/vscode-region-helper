<!--#region FirstRegion-->
<template>
  <div>Hello, World!</div>
</template>
<!--#endregion-->

<!-- #endregion Invalid end boundary -->
<!-- #region Invalid start boundary -->

<!--   #region Second Region -->
<script>
export default {
  //  #region    InnerRegion  
  data() {
    return { msg: "Hello" };
  },
  //  #endregion   ends InnerRegion  

  // #region
  methods: {
    sayHello() {
      console.log("Hello");
    }
  }
  // #endregion
};
</script>
<!-- #endregion -->
