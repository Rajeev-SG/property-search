import { Command } from "commander";
import { runDoctor } from "../../../scripts/doctor.js";
import { listPlans } from "../../../scripts/list-plans.js";
import { validateSyntheticFixture } from "../../../scripts/validate-synthetic-fixture.js";

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

await program.parseAsync(process.argv);
