package com.nativemoduledemo

import android.content.Context
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class KeystoreModule(
    private val reactContext: ReactApplicationContext
) : NativeKeychainModuleSpec(reactContext) {

    companion object {
        private const val KEYSET_NAME    = "keystore_module_keyset"
        private const val KEYSET_PREFS   = "keystore_module_keyset_prefs"
        private const val MASTER_KEY_URI = "android-keystore://keystore_module_master_key"
        private const val STORE_PREFS    = "keystore_module_store"
    }

    // SupervisorJob — ek child crash kare to baaki jobs cancel nahi honge
    // Dispatchers.IO — background thread pool (crypto ke liye perfect)
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    init {
        AeadConfig.register()
    }

    // lazy — pehli call tak initialize mat karo
    // Keystore init khud heavy hai, module load pe block na kare
    private val aead: Aead by lazy {
        AndroidKeysetManager.Builder()
            .withSharedPref(reactContext, KEYSET_NAME, KEYSET_PREFS)
            .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
            .withMasterKeyUri(MASTER_KEY_URI)
            .build()
            .keysetHandle
            .getPrimitive(Aead::class.java)
    }

    private val store by lazy {
        reactContext.getSharedPreferences(STORE_PREFS, Context.MODE_PRIVATE)
    }

    override fun getName() = "NativeKeychainModule"

    @ReactMethod
    override fun setItem(key: String, value: String, promise: Promise) {
        // scope.launch → Dispatchers.IO thread pe jaata hai, JS thread free rehta hai
        scope.launch {
            try {
                val cipherBytes = aead.encrypt(
                    value.toByteArray(Charsets.UTF_8),
                    key.toByteArray(Charsets.UTF_8)
                )
                val encoded = Base64.encodeToString(cipherBytes, Base64.NO_WRAP)
                store.edit().putString(key, encoded).apply()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SET_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    override fun getItem(key: String, promise: Promise) {
        scope.launch {
            try {
                val encoded = store.getString(key, null)
                if (encoded == null) {
                    promise.resolve(null)
                    return@launch          // labeled return — lambda se bahar nikalte hain
                }
                val plainBytes = aead.decrypt(
                    Base64.decode(encoded, Base64.NO_WRAP),
                    key.toByteArray(Charsets.UTF_8)
                )
                promise.resolve(String(plainBytes, Charsets.UTF_8))
            } catch (e: Exception) {
                promise.reject("GET_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    override fun removeItem(key: String, promise: Promise) {
        scope.launch {
            try {
                store.edit().remove(key).apply()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("REMOVE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    override fun hasItem(key: String, promise: Promise) {
        scope.launch {
            try {
                promise.resolve(store.contains(key))
            } catch (e: Exception) {
                promise.reject("HAS_ERROR", e.message, e)
            }
        }
    }

    // ── cleanup ──────────────────────────────────────────────────────────────
    // Module destroy hone pe saare pending coroutines cancel karo
    override fun invalidate() {
        super.invalidate()
        scope.coroutineContext[SupervisorJob]?.cancel()
    }
}