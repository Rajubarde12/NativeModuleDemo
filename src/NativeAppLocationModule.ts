import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
export interface location {
    latitude: number;
    longitude: number;
  }

export interface Spec extends TurboModule {
        getCurrentLocation(): Promise<location>;
        startTracking(): void;
        stopTracking(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LocationModule');
