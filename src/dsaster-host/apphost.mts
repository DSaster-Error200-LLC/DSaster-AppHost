import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const searchService = await builder
    .addJavaScriptApp("SearchService", "./DSaster-SearchService/src/dsaster-search")
    .withUrl("/swagger")
    .withPnpm()
    .withHttpEndpoint({ env: "PORT" })
    .withExternalHttpEndpoints();

await builder
    .addViteApp("Frontend", "./DSaster-Front/src/dsaster-front")
    .withPnpm()
    .withReference(searchService)
    .waitFor(searchService);

await builder.build().run();
