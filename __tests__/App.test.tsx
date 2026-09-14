/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Jest nema Android native module, pa u ovom testu zamjenjujemo samo
// pokretanje baze. Prava SQLite veza provjerava se na emulatoru.
jest.mock('../src/database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

test('renders correctly', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});
