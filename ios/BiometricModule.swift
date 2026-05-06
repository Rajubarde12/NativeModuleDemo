//
//  BiometricModule.swift
//  NativeModuleDemo
//
//  Created by Forebear on 05/05/26.
//

import Foundation
import LocalAuthentication

@objc(NativeAppBiometricModule)
class BiometricModule :NSObject{
  
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func isBiometricAvailable(
    resolve:@escaping RCTPromiseResolveBlock,
    reject:@escaping RCTPromiseRejectBlock
  ){
    let context=LAContext();
    var error:NSError?
    
    let canEvaluate = context.canEvaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      error: &error
    )
    if(canEvaluate){
      switch context.biometryType{
      case .faceID:
        resolve("FACE_ID")
      case .touchID:
        resolve("TOUCH_ID")
      case .opticID:
        resolve("OPTIC_ID")
      default:
        resolve("AVAILABLE")
      }
    }else{
      guard let error=error else{
        resolve("UNAVAILABLE")
        return
      }
      
      switch error.code{
      case LAError.biometryNotEnrolled.rawValue:
        resolve("NOT_ENROLLED")
      case LAError.biometryNotAvailable.rawValue:
        resolve("NOT_SUPPORTED")
      case LAError.biometryLockout.rawValue:
        resolve("LOCKED_OUT")
      default:
        resolve("UNAVAILABLE")
      }
    }
    
  }
  
  @objc
  func authenticate(reason:String,resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock){
    let context = LAContext();
    var error:NSError?
    
    let canEvaluate=context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,error: &error);
    
    guard canEvaluate else {
      reject(
        "NOT_AVAILABLE",
        error?.localizedDescription ?? "Biometric not available",
        error
      )
      return
    }
    
    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,localizedReason: reason){
      success,authError in
      DispatchQueue.main.async{
        if success{
          resolve("SUCCESS")
        }else{
          guard let error = authError as?LAError else{
            reject("AUTH_ERROR", "Unknown error", authError)
                                 return
          }
          
          switch error.code {

                           // User ne cancel kiya
                           case .userCancel,
                                .systemCancel,
                                .appCancel:
                               reject(
                                   "USER_CANCELED",
                                   "User cancelled authentication",
                                   error
                               )

                           // Bahut galat attempts
                           case .biometryLockout:
                               reject(
                                   "LOCKOUT",
                                   "Too many attempts. Use PIN.",
                                   error
                               )

                           // Fallback button dabaya
                           case .userFallback:
                               reject(
                                   "USER_FALLBACK",
                                   "User chose password instead",
                                   error
                               )

                           default:
                               reject(
                                   "AUTH_ERROR",
                                   error.localizedDescription,
                                   error
                               )
                           }
        }
      }
    }
    
  }

}
