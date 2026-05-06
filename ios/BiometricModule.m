//
//  BiometricModule.m
//  NativeModuleDemo
//
//  Created by Forebear on 05/05/26.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(NativeAppBiometricModule, NSObject)
RCT_EXTERN_METHOD(
  isBiometricAvailable:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  authenticate:(NSString *)reason
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)
@end
