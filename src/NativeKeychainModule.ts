import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  // Value save karo
  setItem(key: string, value: string): Promise<boolean>

  // Value read karo
  getItem(key: string): Promise<string | null>

  // Value delete karo
  removeItem(key: string): Promise<boolean>

  // Key exist karta hai?
  hasItem(key: string): Promise<boolean>
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeKeychainModule'
)