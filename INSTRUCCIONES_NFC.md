# Instrucciones para Solucionar el Problema NFC/HCE

## Cambios Realizados

### 1. **api.js** - Corregido bug con `accountId`
   - Se definió correctamente la variable `userId` a partir de `response.user.id`
   - Se agregaron logs para debugging

### 2. **MyHceService.kt y HceModule.kt** - Corregido package name
   - Cambiado de `com.miacoin.hce` a `com.gmoney.hce`
   - Cambiado nombre de SharedPreferences de `miacoin_prefs` a `gmoney_prefs`

### 3. **useHceReader.ts** - Mejorado manejo de errores
   - Eliminado `NfcManager.start()` que causaba conflictos
   - Agregados más logs para debugging
   - Mejorado manejo de timeouts

### 4. **Steal.tsx** - Agregada visualización del ID
   - Ahora parsea el JSON del payload y muestra el ID del usuario detectado

### 5. **HcePackage.kt** - Creado nuevo archivo
   - Package necesario para registrar el módulo nativo

### 6. **MainApplication.kt** - Registrado HceModule
   - Se agregó `HcePackage()` a la lista de packages

## Pasos para Probar

1. **Reconstruir la aplicación Android:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **Verificar permisos NFC:**
   - Asegúrate de que ambos móviles tienen NFC activado en Configuración
   - En móvil A (el que emite HCE): verifica que la app tenga permisos NFC
   - En móvil B (el lector): verifica que la app tenga permisos NFC

3. **Probar la funcionalidad:**
   - **Móvil A**: Cierra sesión y vuelve a iniciar sesión para que se configure el HCE con el ID
   - **Móvil B**: Ve a la pantalla "Steal"
   - Acerca ambos móviles (parte trasera con parte trasera)
   - Deberías ver en móvil B el mensaje "¡Usuario detectado: [id]!"

## Posibles Problemas Adicionales

### Si sigue sin funcionar:

1. **Verificar que el HCE esté configurado en móvil A:**
   ```bash
   adb logcat | grep HceModule
   ```
   Deberías ver: "Configurando HCE con id: [id]"

2. **Verificar que el servicio HCE esté activo:**
   ```bash
   adb logcat | grep MyHceService
   ```

3. **Verificar la lectura NFC en móvil B:**
   ```bash
   adb logcat | grep useHceReader
   ```

4. **Revisar configuración de HCE predeterminado:**
   - Ve a: Configuración > Conexiones > NFC y pagos sin contacto > Tap & Pay
   - Asegúrate de que GMoney esté seleccionada como app de pago predeterminada (si aplica)

### Error "UserCancel"

Este error generalmente ocurre porque:
- El lector NFC se cancela antes de completar la transacción
- Los dispositivos no están lo suficientemente cerca
- La comunicación NFC se interrumpe
- El timeout es muy corto

**Solución:**
- Mantén los dispositivos más tiempo cerca (3-5 segundos)
- Asegúrate de que las partes traseras estén en contacto
- No muevas los dispositivos durante la lectura

## Debugging

Para ver todos los logs relevantes:
```bash
# Móvil A (HCE emisor)
adb -s [SERIAL_A] logcat | grep -E "HceModule|MyHceService"

# Móvil B (lector NFC)
adb -s [SERIAL_B] logcat | grep -E "useHceReader|NfcManager"
```

## Notas Importantes

- El AID usado es: `F0001508050508`
- El payload JSON tiene el formato: `{"type": "tap-announce", "accountId": "[id]"}`
- El servicio HCE responde con código de éxito: `0x9000`
