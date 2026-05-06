//
//  BiomettricModule.mm
//  NativeModuleDemo
//
//  Created by Forebear on 06/05/26.
//

#ifdef __cplusplus

#import <ReactCodegen/AppSpecs/AppSpecs.h>
#import <ReactCommon/RCTTurboModule.h>
#import "NativeModuleDemo-Swift.h"

using namespace facebook::react;

@interface BiometricModule : NSObject <NativeAppBiometricModuleSpec>
@end

@implementation BiometricModule {
    BiometricModuleImpl *_impl;
}

RCT_EXPORT_MODULE(NativeAppBiometricModule)

- (instancetype)init
{
    if (self = [super init]) {
        _impl = [BiometricModuleImpl new];
    }
    return self;
}

// MARK: - isBiometricAvailable

- (void)isBiometricAvailable:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
    [_impl isBiometricAvailable:^(id result) {
        resolve(result);
    } reject:^(NSString *code, NSString *message, NSError *error) {
        reject(code, message, error);
    }];
}

// MARK: - authenticate

- (void)authenticate:(NSString *)reason
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
    [_impl authenticateWithReason:reason
                          resolve:^(id result) {
        resolve(result);
    } reject:^(NSString *code, NSString *message, NSError *error) {
        reject(code, message, error);
    }];
}

// MARK: - TurboModule

- (std::shared_ptr<TurboModule>)getTurboModule:
    (const ObjCTurboModule::InitParams &)params
{
    return std::make_shared<NativeAppBiometricModuleSpecJSI>(params);
}

@end

#endif // __cplusplus
