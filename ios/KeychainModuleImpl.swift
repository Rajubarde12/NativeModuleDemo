//
//  KeychainModuleImpl.swift
//  NativeModuleDemo
//
//  Created by Forebear on 06/05/26.
//

import Foundation
import Security

@objc(KeychainModuleImpl)
class KeychainModuleImpl :NSObject{
  @objc(setItem:value:resolve:reject:)
  func setItem(key: String,value:String,resolve:@escaping (Any?)->Void,reject: @escaping (String,String,Error?)->Void){
    deleteFromKeychain(key: key);
    guard let data=value.data(using:.utf8)else{
      reject("ENCODING_ERROR","value not encoded",nil)
      return
    }
    let query:[String:Any]=[
      kSecClass as String:kSecClassGenericPassword,
      kSecAttrAccount as String:key,
      kSecValueData as String:data,
      kSecAttrAccessible as String:kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    
    ]
    
    let status = SecItemAdd(query as CFDictionary, nil)
    if status == errSecSuccess {
          resolve(true)
        } else {
          reject(
            "KEYCHAIN_ERROR",
            "Save failed: \(status)",
            nil
          )
        }
  }
  
  @objc(getItem:resolve:reject:)
  func getItem(key:String,resolve:@escaping (Any?)-> Void,reject:@escaping (String,String,Error?)->Void){
    let query:[String:Any]=[
      kSecClass as String:       kSecClassGenericPassword,
           kSecAttrAccount as String: key,
           kSecReturnData as String:  true,
           kSecMatchLimit as String:  kSecMatchLimitOne
    ]
    var result:AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary,&result)
    
    if status == errSecSuccess,
       let data = result as? Data,
       let value = String(data: data, encoding: .utf8){
      resolve(value)
    }else if status == errSecItemNotFound{
      resolve(nil)
    }else {
      reject(
             "KEYCHAIN_ERROR",
             "Read failed: \(status)",
             nil
           )
      return
    }
  }
  
  
  @objc(removeItem:resolve:reject:)
  
  func removeItem(
    key: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ){
    let status = deleteFromKeychain(key: key)
    
    if status == errSecSuccess || status == errSecItemNotFound {
      resolve(true)
    }else{
      reject(
              "KEYCHAIN_ERROR",
              "Delete failed: \(status)",
              nil
            )
    }
  }
  
  @objc(hasItem:resolve:reject:)
  func hasItem(key:String,resolve:@escaping (Any?)-> Void,reject:@escaping (String,String,Error?) -> Void){
    let query: [String: Any] = [
          kSecClass as String:       kSecClassGenericPassword,
          kSecAttrAccount as String: key,
          kSecMatchLimit as String:  kSecMatchLimitOne
        ]
    let status = SecItemCopyMatching(query as CFDictionary, nil)
    switch status {
       case errSecSuccess:
         resolve(true)
       case errSecItemNotFound:
         resolve(false)
       default:
         reject(
           "KEYCHAIN_ERROR",
           "Check failed: \(status)",
           nil
         )
       }
    
  }
  
  @discardableResult
   private func deleteFromKeychain(key: String) -> OSStatus {
     let query: [String: Any] = [
       kSecClass as String:       kSecClassGenericPassword,
       kSecAttrAccount as String: key
     ]
     return SecItemDelete(query as CFDictionary)
   }
  
  
  
  
}
