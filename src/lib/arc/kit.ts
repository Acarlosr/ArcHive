// src/lib/arc/kit.ts
// Arc AppKit singleton — import this everywhere instead of creating new instances

import { AppKit } from "@circle-fin/app-kit";

// Single shared instance — AppKit is stateless so this is safe
let _kit: AppKit | null = null;

export function getKit(): AppKit {
  if (!_kit) {
    _kit = new AppKit();
  }
  return _kit;
}

export const kit = getKit();
