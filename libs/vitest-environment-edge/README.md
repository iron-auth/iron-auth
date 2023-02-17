# vitest-environment-edge

This is to needed make ArrayBuffer work in the Edge runtime VM. Not sure why this is needed, maybe Vitest's populateGlobal removes it?

Per the Edge runtime docs, ArrayBuffer should be an available API from the V8 Primitives.

https://edge-runtime.vercel.app/features/available-apis#v8-primitives

Without this, the following error is thrown:
`ArrayBuffer is not a constructor`
