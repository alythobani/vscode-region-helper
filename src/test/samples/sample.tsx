// #region FirstRegion
const x: number = 42;
// #endregion

/* #region SecondRegion */
class MyComponent extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        Hello
        {/* #region InnerRegion */}
        <span>World</span>
        {/**  #endregion  */}
      </div>
    );
  }
  // #endregion

  //  #region
  render2(): JSX.Element {
    return <div>Unnamed region</div>;
  }
  // #endregion
}
/**  #endregion  */
