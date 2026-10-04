## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Before finishing a change, run:

```
npm run check   # astro check (types)
npm test        # node:test
npm run build
```

`public/og.png` is generated from `public/og.svg` with `npm run og` (requires `rsvg-convert`); regenerate it when the social card changes.

Workout programs and exercise guides live in `src/data/workouts.ts`; `duration` there is derived from `rounds` and the default interval, so never hardcode it. Pure logic lives in `src/lib/progress.ts` and `src/lib/timer.ts` and is covered by `tests/`, including a simulated full session.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
