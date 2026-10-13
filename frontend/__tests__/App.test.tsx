/**
 * Prueba de humo del componente raíz.
 *
 * Verifica que el árbol de App se monta sin lanzar errores.
 *
 * `@format` es una directiva de Prettier: le indica que formatee este archivo.
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Nota: se importa explícitamente para usar los tipos que incluye jest.
import {it} from '@jest/globals';

// Nota: el renderizador de pruebas debe requerirse después de react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
