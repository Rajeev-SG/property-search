import { importSourceRegistry } from "@property-search/harness";

type ParsedArgs = {
  dryRun: boolean;
  seedPath?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (argument === "--seed-path") {
      parsed.seedPath = argv[index + 1];
      index += 1;
    }
  }

  return parsed;
}

const args = parseArgs(process.argv.slice(2));
await importSourceRegistry({
  dryRun: args.dryRun,
  seedPath: args.seedPath
});
