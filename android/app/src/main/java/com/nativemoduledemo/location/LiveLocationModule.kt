package  com.nativemoduledemo.location
import  com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import  android.util.Log
@ReactModule(name=LiveLocationModule.NAME)
class LiveLocationModule(reactContext:ReactApplicationContext):NativeLiveLocationSpec(reactContext){
    companion object {
        const val NAME = "DeviceInfoModule"
    }
    override fun getName() = NAME
     fun startTracking() {
        Log.d(NAME, "Tracking Started 🚀")
    }

     fun stopTracking() {
        Log.d(NAME, "Tracking Stopped 🛑")
    }

}
