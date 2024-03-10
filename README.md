# Edify your Deno Fresh website with Edify, a Fresh plugin that creates a portal to your KV data.

```ts
import { defineConfig } from '$fresh/server.ts';

import edifyPlugin from '@epi/edify';

await defineConfig({
	plugins: [
		edifyPlugin(),
	],
});
```
