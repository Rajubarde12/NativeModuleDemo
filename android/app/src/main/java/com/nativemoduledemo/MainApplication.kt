package com.nativemoduledemo

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.nativemoduledemo.location.LocationPackage
import  com.nativemoduledemo.bioauthentication.BiometricPackage
import com.nativemoduledemo.keystore.KeystorePackage
import com.nativemoduledemo.DeviceInfoPackage // Make sure this path is correct!
class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(LocationPackage())
          add(DeviceInfoPackage())
          add(BiometricPackage());
          add(KeystorePackage());
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
