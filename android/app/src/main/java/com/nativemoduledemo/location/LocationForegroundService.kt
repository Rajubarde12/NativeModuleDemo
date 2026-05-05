package com.nativemoduledemo.location

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.HandlerThread
import android.os.IBinder
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.*

class LocationForegroundService : Service() {

    // ✅ reactContextRef lives HERE in LocationForegroundService's companion object
    companion object {
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "location_channel"
        const val TAG = "LocationForegroundService"

        // LocationModule sets this before starting the service
        var reactContextRef: ReactApplicationContext? = null
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var locationCallback: LocationCallback? = null
    private var handlerThread: HandlerThread? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service onStartCommand")
        createNotificationChannel()
        
        val notification = buildNotification()
        // 1. Android 10+ and 14+ specific Foreground Service Requirements
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        
        startLocationUpdates()
        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        if (locationCallback != null) {
            Log.d(TAG, "Already tracking, skipping")
            return
        }

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            2000L
        )
            .setMinUpdateIntervalMillis(1000L)
            .setMinUpdateDistanceMeters(3f)
            .setWaitForAccurateLocation(false)
            .setMaxUpdateDelayMillis(3000L)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.locations.forEach { location ->
                    Log.d(TAG, "Location: lat=${location.latitude}, lng=${location.longitude}, acc=${location.accuracy}")

                    if (location.accuracy > 50f) {
                        Log.d(TAG, "Skipping inaccurate fix: ${location.accuracy}m")
                        return@forEach
                    }

                    val params = Arguments.createMap().apply {
                        putDouble("latitude", location.latitude)
                        putDouble("longitude", location.longitude)
                        putDouble("accuracy", location.accuracy.toDouble())
                        putDouble("speed", location.speed.toDouble())
                        putDouble("bearing", location.bearing.toDouble())
                        putDouble("timestamp", location.time.toDouble())
                    }

                    // Emit event back to React Native
                    reactContextRef?.let { ctx ->
                        try {
                            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                                .emit("onLocationUpdate", params)
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to emit event: ${e.message}")
                        }
                    } ?: Log.w(TAG, "reactContextRef is null — cannot emit event")
                }
            }

            override fun onLocationAvailability(availability: LocationAvailability) {
                Log.d(TAG, "Location available: ${availability.isLocationAvailable}")
            }
        }

        // ✅ Use a background HandlerThread — NOT Looper.getMainLooper()
        handlerThread = HandlerThread("LocationHandlerThread").also { it.start() }

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback!!,
            handlerThread!!.looper
        )

        Log.d(TAG, "Location updates started on background thread")
    }

    private fun stopLocationUpdates() {
        locationCallback?.let {
            fusedLocationClient.removeLocationUpdates(it)
            Log.d(TAG, "Location updates removed")
        }
        locationCallback = null
        handlerThread?.quitSafely()
        handlerThread = null
    }

    override fun onDestroy() {
        Log.d(TAG, "Service destroyed")
        stopLocationUpdates()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ─── Notification ─────────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Location Tracking",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Used for continuous background location tracking"
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        // 2. Interactive PendingIntent - tapping notification opens the app
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = launchIntent?.let {
            PendingIntent.getActivity(
                this, 0, it, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        return Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText("Your location is being tracked")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
}