#import <React/RCTBridgeModule.h>
#import <ReactCodegen/AppSpecs/AppSpecs.h>

#import "NativeModuleDemo-Swift.h"

using namespace facebook::react;

@interface DeviceInfoModule : NSObject <NativeAppDeviceInfoSpec>
@end

@implementation DeviceInfoModule {
  DeviceInfoModuleImpl *_impl;
}

RCT_EXPORT_MODULE(DeviceInfoModule)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _impl = [DeviceInfoModuleImpl new];
  }
  return self;
}

- (void)getDeviceInfo:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl getDeviceInfo:resolve reject:reject];
}

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeAppDeviceInfoSpecJSI>(params);
}

@end
