// Polyfill TextEncoder/TextDecoder for jsdom (react-router v7 uses them at module load time)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
