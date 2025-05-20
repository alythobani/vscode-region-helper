//#region FirstRegion
const x: number = 42;
//#endregion

/***   #region Second Region */
class MyComponent extends React.Component {
  //   #region    InnerRegion
  render(): JSX.Element {
    return (
      <div>
        Hello <span>World</span>
      </div>
    );
  }
  //  #endregion   ends InnerRegion

  /*#region */
  render2(): JSX.Element {
    return <div>Unnamed region</div>;
  }
  /*   #endregion */
}

/**#endregion */
