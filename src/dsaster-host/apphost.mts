import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const elasticsearch = await builder
    .addContainer("Elasticsearch", "docker.io/library/elasticsearch")
    .withImageTag("9.5.3")
    .withHttpEndpoint({ targetPort: 9200, name: "http" });

const searchService = await builder
    .addJavaScriptApp("SearchService", "./DSaster-SearchService/src/dsaster-search")
    .withUrl("/swagger")
    .withPnpm()
    .withHttpEndpoint({ env: "PORT" })
    .withExternalHttpEndpoints()
    .withEnvironment("ELASTICSEARCH_URL", elasticsearch.getEndpoint("http"))
    .waitFor(elasticsearch);

await builder
    .addViteApp("Frontend", "./DSaster-Front/src/dsaster-front")
    .withPnpm()
    .withReference(searchService)
    .waitFor(searchService);

await builder.build().run();
