import Foundation
import LocalAuthentication

@objc(BiometricModuleImpl)
class BiometricModuleImpl: NSObject {

    // MARK: - Check Availability

    @objc
    func isBiometricAvailable(
        _ resolve: @escaping (Any?) -> Void,
        reject:    @escaping (String, String, Error?) -> Void
    ) {
        let context = LAContext()
        var error: NSError?

        let canEvaluate = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        if canEvaluate {
            switch context.biometryType {
            case .faceID:
                resolve("FACE_ID")
            case .touchID:
                resolve("TOUCH_ID")
            case .opticID:
                resolve("OPTIC_ID")
            default:
                resolve("AVAILABLE")
            }
        } else {
            guard let err = error else {
                resolve("UNAVAILABLE")
                return
            }

            // Bug fix: biometryNotEnrolled aur biometryNotAvailable alag hain
            switch err.code {
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

    // MARK: - Authenticate

    @objc
    func authenticate(
        reason:  String,                                    // Bug fix: reasom → reason
        resolve: @escaping (Any?) -> Void,
        reject:  @escaping (String, String, Error?) -> Void
    ) {
        let context = LAContext()
        var error: NSError?

        let canEvaluate = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )

        guard canEvaluate else {
            reject(
                "NOT_AVAILABLE",
                error?.localizedDescription ?? "Biometric not available",
                error
            )
            return
        }

        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        ) { success, authError in

            DispatchQueue.main.async {
                if success {
                    resolve("SUCCESS")
                    return
                }

                guard let laError = authError as? LAError else {
                    reject("AUTH_ERROR", "Unknown error", authError)
                    return
                }

                switch laError.code {
                case .userCancel,
                     .systemCancel,
                     .appCancel:
                    reject(
                        "USER_CANCELED",
                        "User cancelled authentication",
                        laError
                    )

                case .biometryLockout:
                    reject(
                        "LOCKOUT",
                        "Too many attempts. Use PIN.",
                        laError
                    )

                case .userFallback:
                    reject(
                        "USER_FALLBACK",
                        "User chose password instead",
                        laError
                    )

                case .authenticationFailed:
                    reject(
                        "AUTH_FAILED",
                        "Biometric did not match",
                        laError
                    )

                default:
                    reject(
                        "AUTH_ERROR",
                        laError.localizedDescription,
                        laError
                    )
                }
            }
        }
    }
}