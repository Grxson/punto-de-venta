/**
 * Punto de entrada nativo.
 *
 * `@format` es una directiva de Prettier: le indica que formatee este archivo.
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// El nombre registrado debe coincidir con el de `app.json`, que a su vez es el
// que consume `capacitor.config.ts` para el paquete nativo.
AppRegistry.registerComponent(appName, () => App);
