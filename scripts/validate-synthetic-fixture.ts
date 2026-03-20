import { validateSyntheticFixture } from "@property-search/harness";

if (import.meta.url === `file://${process.argv[1]}`) {
  void validateSyntheticFixture();
}
