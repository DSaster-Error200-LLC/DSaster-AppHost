import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const elasticsearch = await builder
    .addContainer("Elasticsearch", "docker.io/library/elasticsearch")
    .withImageTag("9.5.3")
    .withEnvironment("discovery.type", "single-node")
    .withEnvironment("xpack.security.enabled", "false")
    .withEnvironment("ES_JAVA_OPTS", "-Xms512m -Xmx512m")
    .withHttpEndpoint({ targetPort: 9200, name: "http" })
    .withHttpHealthCheck({ path: "/", statusCode: 200, endpointName: "http" });

const searchService = await builder
    .addJavaScriptApp("SearchService", "./DSaster-SearchService/src/dsaster-search")
    .withUrl("/swagger")
    .withPnpm()
    .withHttpEndpoint({ env: "PORT" })
    .withExternalHttpEndpoints()
    .withEnvironment("ELASTICSEARCH_URL", elasticsearch.getEndpoint("http"))
    .waitFor(elasticsearch);

const bookingService = await builder
    .addProject("BookingService", "./sales-module/BookingService.Api")
    .withUrl("/swagger");

await builder
    .addViteApp("Frontend", "./DSaster-Front/src/dsaster-front")
    .withPnpm()
    .withReference(searchService)
    .waitFor(searchService)
    .withReference(bookingService)
    .waitFor(bookingService);

await builder.build().run();
