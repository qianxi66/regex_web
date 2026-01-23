import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

let viz = new Viz({ Module, render });

self.onmessage = async (event) => {
  const { id, dot } = event.data || {};
  if (!id || !dot) return;
  try {
    const svg = await viz.renderString(dot);
    self.postMessage({ id, svg });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Render failed';
    self.postMessage({ id, error: message });
    viz = new Viz({ Module, render });
  }
};
