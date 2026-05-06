#import <ReactCodegen/AppSpecs/AppSpecs.h>
#import <ReactCommon/RCTTurboModule.h>

#import "NativeModuleDemo-Swift.h"

using namespace facebook::react;

@interface DeviceInfoModule : NSObject <NativeAppDeviceInfoSpec>
@end

@implementation DeviceInfoModule {
  DeviceInfoModuleImpl *_impl;
}

RCT_EXPORT_MODULE()

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [DeviceInfoModuleImpl new];
  }
  return self;
}

- (void)getDeviceInfo:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  resolve([_impl getDeviceInfo]);
}

- (std::shared_ptr<TurboModule>)getTurboModule:
(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeAppDeviceInfoSpecJSI>(params);
}

@end
