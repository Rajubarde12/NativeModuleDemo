package com.nativemoduledemo.location

import com.facebook.react.BaseReactPackage
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfo.Companion.classIsTurboModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.nativemoduledemo.DeviceInfoModule


class LocationPackage: BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): LocationModule? = when(name) {
      LocationModule.NAME -> LocationModule(reactContext)
        else -> null
    }

     override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
         val moduleClass = LocationModule::class.java
         val reactModule = checkNotNull(moduleClass.getAnnotation(ReactModule::class.java))
         val moduleInfo =
             ReactModuleInfo(
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