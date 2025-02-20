<!--#region FirstRegion-->
<template>
  <div>Hello, World!</div>
</template>
<!--#endregion-->

<!--   #region SecondRegion -->
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
