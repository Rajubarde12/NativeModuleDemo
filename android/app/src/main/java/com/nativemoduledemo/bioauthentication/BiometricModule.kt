package com.nativemoduledemo.bioauthentication

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.nativemoduledemo.NativeAppBiometricModuleSpec


@ReactModule(name = BiometricModule.NAME)
class BiometricModule(
    reactContext: ReactApplicationContext
) : NativeAppBiometricModuleSpec(reactContext) {
    companion object {
        const val NAME = "NativeAppBiometricModule"
    }

    override fun getName(): String {
        return  NAME
    }

    override fun isBiometricAvailable(promise: Promise?) {
       val biometricManager= BiometricManager.from(reactApplicationContext)

        when(
            biometricManager.canAuthenticate(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
        ){
            BiometricManager.BIOMETRIC_SUCCESS ->
                promise?.resolve("AVAILABLE")

            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                promise?.resolve("NOT_SUPPORTED")

            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                promise?.resolve("UNAVAILABLE")

            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                promise?.resolve("NOT_ENROLLED")

            else ->
                promise?.resolve("UNKNOWN")
        }
    }

    override fun authenticate(reason: String?, promise: Promise?) {
        val activity = reactApplicationContext.currentActivity
        if (activity === null) {
            promise?.reject("AUTH_ERROR", "Activity not available")
            return
        }

        activity.runOnUiThread {
            val callback = object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    promise?.resolve("SUCCESS");
                }

                override fun onAuthenticationFailed() {}
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    when (errorCode) {
                        BiometricPrompt.ERROR_USER_CANCELED,
                        BiometricPrompt.ERROR_NEGATIVE_BUTTON ->
                            promise?.reject(
                                "USER_CANCELED",
                                "User cancelled"
                            )

                        BiometricPrompt.ERROR_LOCKOUT ->
                            promise?.reject(
                                "LOCKOUT",
                                "Too many attempts. Try again later."
                            )

                        BiometricPrompt.ERROR_LOCKOUT_PERMANENT ->
                            promise?.reject(
                                "LOCKOUT_PERMANENT",
                                "Biometric disabled. Use PIN."
                            )

                        else ->
                            promise?.reject(
                                "AUTH_ERROR",
                                errString.toString()
                            )

                    }
                }

            }
            val executor = ContextCompat.getMainExecutor(reactApplicationContext)
            val biometricPrompt = BiometricPrompt(
                activity as FragmentActivity,
                executor,
                callback
            )

            // ─── Dialog UI ────────────────────────────────────────
            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric Authentication")
                .setSubtitle(reason)
                .setConfirmationRequired(false)
                .setAllowedAuthenticators(
                    BIOMETRIC_STRONG or DEVICE_CREDENTIAL
                )
                .build()

            biometricPrompt.authenticate(promptInfo)
        }
    }}









