import { W } from './client/types/global.base';

declare global {
  namespace NodeJS {
    interface Global {
      w: W,
      console: typeof import('./shared/utils/base/console.base.js'),
      serverContent: import('./client/types/serverContentType').ServerContentType
    }
  }

  const w: W
  const console: typeof import('./shared/utils/base/console.base.js')
  const serverContent: import('./client/types/serverContentType').ServerContentType
}

export {}
