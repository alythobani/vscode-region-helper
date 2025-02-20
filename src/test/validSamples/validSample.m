//#region FirstRegion
#import <Foundation/Foundation.h>
//#endregion

// #endregion Invalid end boundary
// #region Invalid start boundary

//  #region Second Region
@interface MyClass : NSObject
//  #region    InnerRegion  
- (void)myMethod;
//  #endregion  ends InnerRegion   

//  #region
@property (nonatomic, strong) NSString *name;
// #endregion
@end
// #endregion
