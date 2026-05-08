package com.nativemoduledemo.keystore

import android.content.Context
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

// ✅ @ReactModule annotation — BaseReactPackage ke liye zaroori
@ReactModule(name = KeystoreModule.NAME)
class KeystoreModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NativeKeychainModule"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    init { AeadConfig.register() }

    private val aead: Aead by lazy {
        AndroidKeysetManager.Builder()
            .withSharedPref(reactContext, "keystore_module_keyset", "keystore_module_keyset_prefs")
            .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
            .withMasterKeyUri("android-keystore://keystore_module_master_key")
            .build()
            .keysetHandle
            .getPrimitive(Aead::class.java)
    }

    private val store by lazy {
        reactContext.getSharedPreferences("keystore_module_store", Context.MODE_PRIVATE)
    }

    override fun getName() = NAME


    @ReactMethod
    fun setItem(key: String, value: String, promise: Promise) {
        scope.launch {
            try {
                val encoded = Base64.encodeToString(
                    aead.encrypt(
                        value.toByteArray(Charsets.UTF_8),
                        key.toByteArray(Charsets.UTF_8)
                    ),
                    Base64.NO_WRAP
                )
                            val success = store.edit().putString(key, encoded).commit()
                            if (success) {
                                promise.resolve(true)
                            } else {
                                promise.reject("SET_ERROR", "Failed to save to SharedPreferences")
                            }
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e.message, e)
            }
        }
    }


    @ReactMethod
    fun getItem(key: String, promise: Promise) {
        scope.launch {
            try {
                val encoded = store.getString(key, null)
                if (encoded == null) { promise.resolve(null); return@launch }
                val plainBytes = aead.decrypt(
                    Base64.decode(encoded, Base64.NO_WRAP),
                    key.toByteArray(Charsets.UTF_8)
                )
                promise.resolve(String(plainBytes, Charsets.UTF_8))
            } catch (e: Exception) {
                            // Decryption failed (e.g. Keystore keys were lost after app reinstall)
                            // Clear the un-decryptable token and resolve null to force re-login
                            store.edit().remove(key).commit()
                            promise.resolve(null)
            }
        }
    }


    @ReactMethod
    fun removeItem(key: String, promise: Promise) {
        scope.launch {
            try {
                            val success = store.edit().remove(key).commit()
                            promise.resolve(success)
            } catch (e: Exception) {
                promise.reject("REMOVE_ERROR", e.message, e)
            }
        }
    }


    @ReactMethod
    fun hasItem(key: String, promise: Promise) {
        scope.launch {
            try {
                promise.resolve(store.contains(key))
            } catch (e: Exception) {
                promise.reject("HAS_ERROR", e.message, e)
            }
        }
    }

    override fun invalidate() {
        super.invalidate()
        scope.cancel()
    }
}