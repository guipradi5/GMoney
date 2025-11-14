package com.gmoney.hce

import android.content.Context
import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import org.json.JSONObject
import android.util.Log

class MyHceService : HostApduService() {
    private val TAG = "MyHceService"

    // SELECT AID APDU starts with: 00 A4 04 00 <Lc> <AID>
    private fun isSelectAidCommand(commandApdu: ByteArray): Boolean {
        if (commandApdu.size < 4) return false
        // CLA INS P1 P2
        val cla = commandApdu[0].toInt() and 0xFF
        val ins = commandApdu[1].toInt() and 0xFF
        val p1 = commandApdu[2].toInt() and 0xFF
        val p2 = commandApdu[3].toInt() and 0xFF
        return (ins == 0xA4 && p1 == 0x04 && p2 == 0x00)
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray? {
        Log.d(TAG, "processCommandApdu: received ${commandApdu?.size ?: 0} bytes")
        if (commandApdu == null) return null

        try {
            if (isSelectAidCommand(commandApdu)) {
                // Construir payload desde SharedPreferences
                val prefs = applicationContext.getSharedPreferences("gmoney_prefs", Context.MODE_PRIVATE)
                val accountId = prefs.getString("accountId", "") ?: ""

                val payload = JSONObject()
                payload.put("type", "tap-announce")
                payload.put("accountId", accountId)

                val payloadBytes = payload.toString().toByteArray(Charsets.UTF_8)
                // SW success 0x90 0x00
                val sw = byteArrayOf(0x90.toByte(), 0x00.toByte())
                val response = payloadBytes + sw
                Log.d(TAG, "Responding with payload: ${payload.toString()}")
                return response
            } else {
                // Podrías soportar otras APDUs (p. ej. comando personalizado para firmar nonce).
                Log.d(TAG, "APDU no SELECT AID, ignorado")
                // devolver SW instrucción no soportada 0x6D00
                return byteArrayOf(0x6D.toByte(), 0x00.toByte())
            }
        } catch (ex: Exception) {
            Log.e(TAG, "Error en processCommandApdu", ex)
            return byteArrayOf(0x6F.toByte(), 0x00.toByte()) // error interno
        }
    }

    override fun onDeactivated(reason: Int) {
        Log.d(TAG, "HCE onDeactivated reason=$reason")
    }
}
