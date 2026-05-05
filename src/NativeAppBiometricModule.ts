import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
    // Device me biometric available hai?
    isBiometricAvailable(): Promise<string>

    // Authenticate karo
    authenticate(reason: string): Promise<string>
}

export default TurboModuleRegistry.getEnforcing<Spec>(
    'NativeAppBiometricModule'  // ← Ye naam Native side se match karna chahiye
)