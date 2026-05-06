import Foundation
import CoreLocation

@objc(LocationModuleImpl)
class LocationModuleImpl: NSObject {

    // MARK: - Properties

    private var locationManager: CLLocationManager?
    private var locationDelegate: LocationDelegateWrapper?

    private var pendingRequests: [
        (
            resolve: (NSDictionary) -> Void,
            reject: (String, String, Error?) -> Void
        )
    ] = []

    private let queueLock = NSLock()

    // MARK: - Setup

    private func setupLocationManagerIfNeeded() {

        if locationManager == nil {
            locationManager = CLLocationManager()
        }

        if locationDelegate == nil {
            locationDelegate = LocationDelegateWrapper(module: self)
        }

        locationManager?.delegate = locationDelegate
    }

    // MARK: - Public API

    @objc
    func getCurrentLocation(
        _ resolve: @escaping (NSDictionary) -> Void,
        reject: @escaping (
            String,
            String,
            Error?
        ) -> Void
    ) {

        DispatchQueue.main.async {

            self.queueLock.lock()

            self.pendingRequests.append(
                (
                    resolve: resolve,
                    reject: reject
                )
            )

            self.queueLock.unlock()

            self.setupLocationManagerIfNeeded()

            self.locationManager?.requestWhenInUseAuthorization()
            self.locationManager?.requestLocation()
        }
    }

    @objc
    func startTracking() {

        DispatchQueue.main.async {

            self.setupLocationManagerIfNeeded()

            self.locationManager?.desiredAccuracy =
                kCLLocationAccuracyBestForNavigation

            self.locationManager?.distanceFilter = 3

            self.locationManager?.allowsBackgroundLocationUpdates = true

            self.locationManager?.pausesLocationUpdatesAutomatically = false

            self.locationManager?.showsBackgroundLocationIndicator = true

            self.locationManager?.requestAlwaysAuthorization()

            self.locationManager?.startUpdatingLocation()
        }
    }

    @objc
    func stopTracking() {

        DispatchQueue.main.async {

            self.locationManager?.stopUpdatingLocation()

            self.locationManager?.delegate = nil
            self.locationDelegate = nil
            self.locationManager = nil
        }
    }

    // MARK: - Internal Handlers

    func handleSingleLocation(
        _ location: CLLocation
    ) {

        queueLock.lock()

        let requests = pendingRequests
        pendingRequests.removeAll()

        queueLock.unlock()

        let response: NSDictionary = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "timestamp":
                location.timestamp.timeIntervalSince1970 * 1000
        ]

        requests.forEach {
            $0.resolve(response)
        }
    }

    func handleSingleError(
        _ error: Error
    ) {

        queueLock.lock()

        let requests = pendingRequests
        pendingRequests.removeAll()

        queueLock.unlock()

        requests.forEach {
            $0.reject(
                "LOCATION_ERROR",
                error.localizedDescription,
                error
            )
        }
    }
}

// MARK: - CLLocationManagerDelegate

private final class LocationDelegateWrapper:
    NSObject,
    CLLocationManagerDelegate {

    weak var module: LocationModuleImpl?

    init(module: LocationModuleImpl) {
        self.module = module
    }

    func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {

        guard let location = locations.last else {
            return
        }

        module?.handleSingleLocation(location)
    }

    func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {

        module?.handleSingleError(error)
    }
}
