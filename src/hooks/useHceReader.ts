import { useEffect, useRef, useState, useCallback } from "react";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { Buffer } from "buffer";
import { TextDecoder } from "text-encoding";


// Convierte string hex a array de bytes
function hexStringToByteArray(hexString: string) {
    const result = [];
    for (let i = 0; i < hexString.length; i += 2) {
        result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
}

// Convierte hex string a Uint8Array
function hexToBytes(hex: string) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// Construye APDU para SELECT AID
function buildSelectApdu(aidHex: string) {
    const aidBytes = hexToBytes(aidHex);
    const lc = aidBytes.length;
    const header = [0x00, 0xA4, 0x04, 0x00, lc];
    const apdu = header.concat(aidBytes);
    return Buffer.from(apdu);
}

export function useHceReader(aidHex: string) {
    const [isListening, setIsListening] = useState(false);
    const [lastPayload, setLastPayload] = useState<string | null>(null);
    const readingRef = useRef(false);

    // Función que hace la lectura de HCE
    const readHceOnce = useCallback(async () => {
        try {
            console.log("Iniciando lectura NFC...");
            await NfcManager.requestTechnology(NfcTech.IsoDep, {
                alertMessage: 'Acerca el otro móvil para leer',
            });

            console.log("Tecnología NFC solicitada. Construyendo APDU...");
            const selectApdu = buildSelectApdu(aidHex);
            const apduBytes = hexToBytes(selectApdu.toString("hex"))

            console.log("Enviando APDU:", apduBytes);
            // Enviar el APDU
            const resp: any = await (NfcManager as any).transceive(apduBytes);

            console.log("Respuesta recibida:", resp);
            const respBytes: number[] =
                typeof resp === "string" ? hexStringToByteArray(resp) : Array.from(resp as number[]);
            const len = respBytes.length;
            if (len < 2) throw new Error("Respuesta demasiado corta");

            const sw1: number = respBytes[len - 2];
            const sw2: number = respBytes[len - 1];
            const payloadBytes = respBytes.slice(0, len - 2);
            const payload = new TextDecoder().decode(Uint8Array.from(payloadBytes));

            console.log("HCE payload:", payload, `SW=${sw1.toString(16)}${sw2.toString(16)}`);
            setLastPayload(payload);
            console.log("Lectura NFC completada.");

            return { payload, sw1, sw2 };
        } catch (err: any) {
            console.warn("Error al leer HCE:", err);
            console.warn("Error tipo:", err?.constructor?.name);
            throw err;
        } finally {
            try {
                await NfcManager.cancelTechnologyRequest();
            } catch (_) { }
        }
    }, [aidHex]);

    // Arrancar lectura en bucle continuo
    const startReading = useCallback(() => {
        if (readingRef.current) return;
        readingRef.current = true;
        setIsListening(true);

        (async function loop() {
            while (readingRef.current) {
                try {
                    await readHceOnce();
                } catch (_) {
                    // Espera antes de reintentar
                    await new Promise<void>(res => setTimeout(res, 800));
                }
            }
        })();
    }, [readHceOnce]);

    const stopReading = useCallback(() => {
        readingRef.current = false;
        setIsListening(false);
        NfcManager.cancelTechnologyRequest().catch(() => { });
    }, []);

    useEffect(() => {
        return () => {
            readingRef.current = false;
            NfcManager.cancelTechnologyRequest().catch(() => { });
        };
    }, []);

    return { isListening, lastPayload, setLastPayload, startReading, stopReading };
}
