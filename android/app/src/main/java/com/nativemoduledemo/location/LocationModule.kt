package com.nativemoduledemo.location

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.nativemoduledemo.NativeAppLocationModuleSpec

@ReactModule(name = LocationModule.NAME)
class LocationModule(reactContext: ReactApplicationContext) :
    NativeAppLocationModuleSpec(reactContext) {

    // ✅ ONE companion object only — NAME and TAG live here
    companion object {
        const val NAME = "LocationModule"
        const val TAG = "LocationModule"
    }

    override fun getName(): String = NAME

    private val fusedLocationClient =
        LocationServices.getFusedLocationProviderClient(reactContext)

    // ─── One-shot current location ───────────────────────────────────────────

    @SuppressLint("MissingPermission")
    override fun getCurrentLocation(promise: Promise) {
        // 1. Fail-fast native permission check
        if (ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "Location permission is not granted natively.")
            return
        }

        // 2. Use CancellationToken to prevent hanging requests & memory leaks
        val cancellationTokenSource = CancellationTokenSource()
        
        fusedLocationClient.getCurrentLocation(
            Priority.PRIORITY_HIGH_ACCURACY, 
            cancellationTokenSource.token
        )
            .addOnSuccessListener { location ->
                if (location != null) {
                    val result = Arguments.createMap().apply {
                        putDouble("latitude", location.latitude)
                        putDouble("longitude", location.longitude)
                        putDouble("accuracy", location.accuracy.toDouble())
                        putDouble("timestamp", location.time.toDouble())
                    }
                    promise.resolve(result)
                } else {
                    promise.reject(
                        "LOCATION_ERROR",
                        "Last location not available. Make sure GPS is enabled."
                    )
                }
            }
            .addOnFailureListener { error ->
                promise.reject("LOCATION_ERROR", error.message)
            }
    }

    // ─── Continuous tracking ─────────────────────────────────────────────────

    override fun startTracking() {
        Log.d(TAG, "startTracking called")

        // ✅ reactContextRef lives in LocationForegroundService's companion object
        LocationForegroundService.reactContextRef = reactApplicationContext

        val serviceIntent = Intent(
            reactApplicationContext,
            LocationForegroundService::class.java
        )

        // 3. Robust service start handling for Android 12+ background start restrictions
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(serviceIntent)
            } else {
                reactApplicationContext.startService(serviceIntent)
            }
            Log.d(TAG, "LocationForegroundService started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start foreground service: ${e.message}")
        }
    }

    override fun stopTracking() {
        Log.d(TAG, "stopTracking called")

        val serviceIntent = Intent(
            reactApplicationContext,
            LocationForegroundService::class.java
        )

        reactApplicationContext.stopService(serviceIntent)

        // ✅ Clear static ref to avoid memory leak
        LocationForegroundService.reactContextRef = null

        Log.d(TAG, "LocationForegroundService stopped")
    }
}