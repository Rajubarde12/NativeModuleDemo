import Foundation
import UIKit

@objc(DeviceInfoModuleImpl)
class DeviceInfoModuleImpl: NSObject {

  @objc
  func getDeviceInfo() -> [String: String] {

    let device = UIDevice.current

    return [
      "deviceName": device.name,
      "systemName": device.systemName,
      "systemVersion": device.systemVersion,
      "model": device.model
    ]
  }
}
