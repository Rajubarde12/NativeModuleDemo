package com.nativemoduledemo.bioauthentication
import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class BiometricPackage : TurboReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        return if (name == BiometricModule.NAME) {
            BiometricModule(reactContext)
        } else null
    }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            BiometricModule.NAME to ReactModuleInfo(
                BiometricModule.NAME,
                BiometricModule.NAME,
                false,
                false,
                false,
                true  // ✅ isTurboModule = true — ye Location me false tha!
            )
        )
    }
}