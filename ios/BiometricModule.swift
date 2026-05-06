//
//  BiometricModule.swift
//  NativeModuleDemo
//
//  Created by Forebear on 05/05/26.
//

import Foundation
import LocalAuthentication

@objc(BiometricModule)
class BiometricModule :NSObject{
  
  @objc
  func isBiometricAvailable(
    _resolve:@escaping RCTPromiseResolveBlock,
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
           _resolve("FACE_ID")
      case .touchID:
           _resolve("TOUCH_ID")
      case .opticID:
           _resolve("OPTIC_ID")
      default:
          _resolve("AVAILABLE")
      }
    }else{
      guard let error=error else{
        _resolve("UNAVAILABLE")
        return
      }
      
      switch error.code{
      case LAError.biometryNotAvailable.rawValue:
        _resolve("NOT_ENROLLED")
      case LAError.biometryNotAvailable.rawValue:
        _resolve("NOT_SUPPORTED")
      case LAError.biometryLockout.rawValue:
                    _resolve("LOCKED_OUT")
      default:
        _resolve("UNAVAILABLE")
      }
    }
    
  }
  
  @objc
  func authenticate(reasom:String,resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock){
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
    
    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,localizedReason: reasom){
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
