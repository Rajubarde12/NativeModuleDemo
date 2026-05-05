#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LocationModule, RCTEventEmitter)

RCT_EXTERN_METHOD(
  getCurrentLocation:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(startTracking)
RCT_EXTERN_METHOD(stopTracking)

@end
