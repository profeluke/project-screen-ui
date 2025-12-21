#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataManager, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWidgetData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 