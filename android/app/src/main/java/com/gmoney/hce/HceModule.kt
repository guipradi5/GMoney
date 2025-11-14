package com.gmoney.hce

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HceModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val PREFS = "gmoney_prefs"

    override fun getName(): String {
        return "HceModule"
    }

    @ReactMethod
    fun setAccountId(id: String) {
        val prefs = reactContext.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
        prefs.edit().putString("accountId", id).apply()
    }

    @ReactMethod
    fun clearProtection() {
        val prefs = reactContext.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
        prefs.edit().putLong("protectedUntil", 0L).apply()
    }
}
