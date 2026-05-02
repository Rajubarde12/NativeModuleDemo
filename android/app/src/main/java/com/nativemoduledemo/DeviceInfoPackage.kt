package com.nativemoduledemo

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfo.Companion.classIsTurboModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class DeviceInfoPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? = when (name) {
        DeviceInfoModule.NAME -> DeviceInfoModule(reactContext)
        else -> null
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        val moduleClass = DeviceInfoModule::class.java
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
