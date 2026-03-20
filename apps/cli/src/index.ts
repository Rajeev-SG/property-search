import { Command } from "commander";
import {
  applyMigrations,
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

await program.parseAsync(process.argv);
