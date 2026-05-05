import Foundation
import CoreLocation
import React

// ✅ @objc name = .m file ka RCT_EXTERN_MODULE name
@objc(LocationModule)
class LocationModule: RCTEventEmitter {

    private var locationManager: CLLocationManager?
    private var locationDelegate: LocationDelegateWrapper?
    private var hasListeners = false
    private var singleResolve: RCTPromiseResolveBlock?
    private var singleReject: RCTPromiseRejectBlock?

    override static func moduleName() -> String! {
        return "LocationModule"
    }

    override func supportedEvents() -> [String]! {
        return ["onLocationUpdate"]
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    // ─── getCurrentLocation ──────────────────────────────────────

    @objc
    func getCurrentLocation(
        _ resolve: @escaping RCTPromiseResolveBlock,  // ✅ space hai
        reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.singleResolve = resolve
            self.singleReject = reject

            if self.locationManager == nil {
                self.locationManager = CLLocationManager()
                self.locationDelegate = LocationDelegateWrapper(module: self)
                self.locationManager?.delegate = self.locationDelegate
            }
            
            self.locationManager?.requestWhenInUseAuthorization()
            self.locationManager?.requestLocation() // Actively fetch fresh location
        }
    }

    // ─── startTracking ───────────────────────────────────────────

    @objc
    func startTracking() {
        DispatchQueue.main.async {
            self.locationDelegate = LocationDelegateWrapper(module: self)
            self.locationManager = CLLocationManager()
            self.locationManager?.delegate = self.locationDelegate
            self.locationManager?.desiredAccuracy = kCLLocationAccuracyBest
            self.locationManager?.distanceFilter = 3
            self.locationManager?.allowsBackgroundLocationUpdates = true
            self.locationManager?.pausesLocationUpdatesAutomatically = false
            self.locationManager?.requestAlwaysAuthorization()
            self.locationManager?.startUpdatingLocation()
        }
    }

    // ─── stopTracking ────────────────────────────────────────────

    @objc
    func stopTracking() {
        DispatchQueue.main.async {
            self.locationManager?.stopUpdatingLocation()
            self.locationManager = nil
            self.locationDelegate = nil
        }
    }

    func emitLocationUpdate(body: [String: Any]) {
        guard hasListeners else { return }
        sendEvent(withName: "onLocationUpdate", body: body)
    }

    func handleSingleLocation(_ location: CLLocation) {
        if let resolve = singleResolve {
            resolve([
                "latitude": location.coordinate.latitude,
                "longitude": location.coordinate.longitude,
                "accuracy": location.horizontalAccuracy,
                "timestamp": location.timestamp.timeIntervalSince1970 * 1000
            ])
            singleResolve = nil
            singleReject = nil
        }
    }

    func handleSingleError(_ error: Error) {
        if let reject = singleReject {
            reject("LOCATION_ERROR", error.localizedDescription, error)
            singleResolve = nil
            singleReject = nil
        }
    }
}

// ─── Private Delegate Wrapper ──────────────────────────────────────

private class LocationDelegateWrapper: NSObject, CLLocationManagerDelegate {
    weak var module: LocationModule?

    init(module: LocationModule) {
        self.module = module
    }

    func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let location = locations.last else { return }
        
        // Handle the one-shot request
        module?.handleSingleLocation(location)

        guard location.horizontalAccuracy <= 50 else { return }

        module?.emitLocationUpdate(body: [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "speed": location.speed,
            "bearing": location.course,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ])
    }

    func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        module?.handleSingleError(error)
        print("Location error: \(error.localizedDescription)")
    }
}
