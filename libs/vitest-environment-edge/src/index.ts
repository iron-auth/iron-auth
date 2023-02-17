import { EdgeVM } from '@edge-runtime/vm';
import type { Environment } from 'vitest';
import { populateGlobal } from 'vitest/environments';

export default <Environment>{
  name: 'edge',
  async setup(global) {
    const vm = new EdgeVM({
      extend: (context) => {
        context['global'] = context;
        context['Buffer'] = Buffer;

        /*
         * NOTE: This is to needed make ArrayBuffer work in the Edge runtime VM. Not sure why this is needed, maybe Vitest's populateGlobal removes it?
         *
         * Per the Edge runtime docs, ArrayBuffer should be an available API from the V8 Primitives.
         *
         * https://edge-runtime.vercel.app/features/available-apis#v8-primitives
         *
         * Without this, the following error is thrown:
         *   `ArrayBuffer is not a constructor`
         */
        context.ArrayBuffer = ArrayBuffer;
        context.Uint8Array = Uint8Array;
        context.URL = URL;

        return context;
      },
    });
    const { keys, originals } = populateGlobal(global, vm.context, { bindFunctions: true });
    return {
      teardown(g) {
        // eslint-disable-next-line no-param-reassign
        keys.forEach((key) => delete g[key]);
        // eslint-disable-next-line no-return-assign, no-param-reassign
        originals.forEach((v, k) => (g[k] = v));
      },
    };
  },
};
