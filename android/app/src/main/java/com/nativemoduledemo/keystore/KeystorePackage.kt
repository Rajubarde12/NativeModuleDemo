package com.nativemoduledemo.keystore

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfo.Companion.classIsTurboModule
import com.facebook.react.module.model.ReactModuleInfoProvider

class KeystorePackage : TurboReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? = when (name) {
        KeystoreModule.NAME -> KeystoreModule(reactContext)
        else -> null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        val moduleClass = KeystoreModule::class.java
        val reactModule = checkNotNull(moduleClass.getAnnotation(ReactModule::class.java))
        val moduleInfo = ReactModuleInfo(
            reactModule.name,
            moduleClass.name,
            reactModule.canOverrideExistingModule,
            reactModule.needsEagerInit,
            reactModule.isCxxModule,
            classIsTurboModule(moduleClass),
        )
        return ReactModuleInfoProvider { mapOf(reactModule.name to moduleInfo) }
    }
}