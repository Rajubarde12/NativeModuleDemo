package com.nativemoduledemo.keystore

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class KeystorePackage : ReactPackage {

    // Native modules register karo — yahan KeystoreModule add karo
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(KeystoreModule(reactContext))

    // Koi UI/View module nahi hai — empty list return karo
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}