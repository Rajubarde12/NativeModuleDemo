import Foundation
import React
import UIKit

@objc(DeviceInfoModuleImpl)
class DeviceInfoModuleImpl: NSObject {

  @objc func getDeviceInfo(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let device = UIDevice.current
    resolve([
      "deviceName":    device.name,
      "systemName":    device.systemName,
      "systemVersion": device.systemVersion,
      "model":         device.model
    ])
  }
}
