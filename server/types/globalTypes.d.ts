export * from './plugin';
export * from './processComunication';
export * from './pluginFunctions.cjs';
export * from './utils.js';

import { addPlugin as aP } from './pluginFunctions.cjs';

declare global {
  namespace NodeJS {
    interface Global {
      addPlugin: typeof aP
    }
  }

  const addPlugin: typeof aP
}

export {}
