import { Command } from "commander";
import {
  createProviderRegistry,
  summarizeProviderRegistry
} from "@property-search/crawl";
import {
  applyMigrations,
  runArtifactStorageSmoke,
  printMigrationStatus,
  listPlans,
  runDoctor,
  validateSyntheticFixture,
  verifyDatabaseSchema
} from "@property-search/harness";

const program = new Command();

program
  .name("property-search")
  .description("Local harness-ready CLI shell for property-search ingestion")
  .version("0.1.0");

program
  .command("doctor")
  .description("Validate local repo prerequisites")
  .action(async () => {
    await runDoctor();
  });

program
  .command("plans")
  .description("List execution plans")
  .action(async () => {
    await listPlans();
  });

program
  .command("providers")
  .description("Print resolved provider defaults, runtime mode, and registry wiring")
  .action(async () => {
    const registry = createProviderRegistry();
    console.log(JSON.stringify(summarizeProviderRegistry(registry), null, 2));
  });

program
  .command("validate-fixture")
  .description("Validate the synthetic canonical listing fixture")
  .action(async () => {
    await validateSyntheticFixture();
  });

const dbCommand = program
  .command("db")
  .description("Database migration and schema helpers");

dbCommand
  .command("migrate")
  .description("Apply deterministic SQL migrations to the local Postgres database")
  .action(async () => {
    await applyMigrations();
  });

dbCommand
  .command("status")
  .description("Show applied and pending database migrations")
  .action(async () => {
    await printMigrationStatus();
  });

dbCommand
  .command("verify")
  .description("Verify that the expected core pipeline tables exist")
  .action(async () => {
    await verifyDatabaseSchema();
  });

const artifactsCommand = program
  .command("artifacts")
  .description("Artifact storage and run-ledger helpers");

artifactsCommand
  .command("smoke")
  .description("Create a synthetic local run with deterministic artifact paths")
  .option("--persist-db", "Persist the smoke run ledger to Postgres")
  .action(async (options: { persistDb?: boolean }) => {
    await runArtifactStorageSmoke({
      persistToDatabase: Boolean(options.persistDb)
    });
  });

await program.parseAsync(process.argv);
