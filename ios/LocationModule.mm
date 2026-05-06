#import <ReactCodegen/AppSpecs/AppSpecs.h>
#import <ReactCommon/RCTTurboModule.h>

#import "NativeModuleDemo-Swift.h"

using namespace facebook::react;

@interface LocationModule : NSObject <NativeAppLocationModuleSpec>
@end

@implementation LocationModule {
  LocationModuleImpl *_impl;
}

RCT_EXPORT_MODULE()

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [LocationModuleImpl new];
  }
  return self;
}

- (void)getCurrentLocation:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [_impl getCurrentLocation:resolve reject:reject];
}

- (void)startTracking
{
  [_impl startTracking];
}

- (void)stopTracking
{
  [_impl stopTracking];
}

- (std::shared_ptr<TurboModule>)getTurboModule:
(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeAppLocationModuleSpecJSI>(params);
}

@end
