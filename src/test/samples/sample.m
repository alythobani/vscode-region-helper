//#region FirstRegion
#import <Foundation/Foundation.h>
//#endregion

//  #region SecondRegion
@interface MyClass : NSObject
//  #region    InnerRegion  
- (void)myMethod;
//  #endregion  ends InnerRegion   

//  #region
@property (nonatomic, strong) NSString *name;
// #endregion
@end
// #endregion
