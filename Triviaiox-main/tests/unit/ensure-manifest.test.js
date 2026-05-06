'use strict';

const { shouldCheckManifest } = require('../../scripts/ensure-manifest');

describe('ensure-manifest', () => {
  describe('shouldCheckManifest', () => {
    it('returns false when no staged files', () => {
      expect(shouldCheckManifest([])).toBe(false);
    });

    it('returns false when only manifest file is staged', () => {
      expect(shouldCheckManifest(['.triviaiox-core/install-manifest.yaml'])).toBe(false);
    });

    it('returns true when any other .triviaiox-core file is staged', () => {
      expect(shouldCheckManifest(['.triviaiox-core/core-config.yaml'])).toBe(true);
      expect(
        shouldCheckManifest([
          'README.md',
          '.triviaiox-core/infrastructure/scripts/ide-sync/index.js',
        ]),
      ).toBe(true);
    });

    it('returns false when only non-.triviaiox-core files are staged', () => {
      expect(shouldCheckManifest(['README.md', 'package.json'])).toBe(false);
    });
  });
});

