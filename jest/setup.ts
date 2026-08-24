/**
 * Setup dos testes.
 * O AsyncStorage é um módulo nativo: nos testes usamos o mock oficial da
 * biblioteca para que a camada de dados de demonstração possa ser exercitada.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
