#ifdef __cplusplus

#import <ReactCodegen/AppSpecs/AppSpecs.h>
#import <ReactCommon/RCTTurboModule.h>
#import "NativeModuleDemo-Swift.h"

using namespace facebook::react;

@interface KeychainModule : NSObject <NativeKeychainModuleSpec>
@end

@implementation KeychainModule {
  KeychainModuleImpl *_impl;
}

RCT_EXPORT_MODULE(NativeKeychainModule)

- (instancetype)init {
  if (self = [super init]) {
    _impl = [KeychainModuleImpl new];
  }
  return self;
}

- (void)setItem:(NSString *)key
          value:(NSString *)value
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  [_impl setItem:key value:value resolve:^(id result) {
    resolve(result);
  } reject:^(NSString *code, NSString *message, NSError *error) {
    reject(code, message, error);
  }];
}

- (void)getItem:(NSString *)key
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  [_impl getItem:key resolve:^(id result) {
    resolve(result);
  } reject:^(NSString *code, NSString *message, NSError *error) {
    reject(code, message, error);
  }];
}

- (void)removeItem:(NSString *)key
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  [_impl removeItem:key resolve:^(id result) {
    resolve(result);
  } reject:^(NSString *code, NSString *message, NSError *error) {
    reject(code, message, error);
  }];
}

- (void)hasItem:(NSString *)key
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  [_impl hasItem:key resolve:^(id result) {
    resolve(result);
  } reject:^(NSString *code, NSString *message, NSError *error) {
    reject(code, message, error);
  }];
}

- (std::shared_ptr<TurboModule>)getTurboModule:
    (const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeKeychainModuleSpecJSI>(params);
}

@end

#endif
