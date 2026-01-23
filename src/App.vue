<template>
  <div class="min-h-screen bg-[#f5f5f5] text-gray-800">
    <header class="bg-teal-600 text-white shadow">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-3">
          <div class="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
            Toolbox
          </div>
          <span class="text-lg font-semibold">Regex Automata Lab</span>
        </div>
        <div class="space-x-4 text-sm font-semibold">
          <a
            class="hover:text-teal-100 transition-colors"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repo
          </a>
          <a
            class="hover:text-teal-100 transition-colors"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Issues
          </a>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg bg-white p-5 shadow">
          <h3 class="text-base font-semibold text-gray-800">Introduction</h3>
          <p class="mt-2 text-sm text-gray-600">
            Convert simple regular expressions to deterministic finite automaton.
          </p>
        </div>
        <div class="rounded-lg bg-white p-5 shadow">
          <h3 class="text-base font-semibold text-gray-800">Supported grammars</h3>
          <ul class="mt-2 space-y-1 text-sm text-gray-600">
            <li>r = (s)</li>
            <li>r = st</li>
            <li>r = s | t</li>
            <li>r = s*</li>
            <li>r = ε</li>
            <li>and similar simple patterns</li>
          </ul>
        </div>
        <div class="rounded-lg bg-white p-5 shadow">
          <h3 class="text-base font-semibold text-gray-800">Examples</h3>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="example in examples"
              :key="example"
              class="rounded-full border border-teal-200 px-3 py-1 text-sm font-semibold text-teal-700 transition hover:border-teal-500 hover:text-teal-900"
              type="button"
              @click="applyExample(example)"
            >
              {{ example }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div class="flex-1">
          <label class="text-sm font-semibold text-gray-700">Input</label>
          <input
            v-model="regexInput"
            class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="Enter a regex, e.g. (a|b)*"
            type="text"
          />
        </div>
        <button
          class="inline-flex items-center justify-center rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-not-allowed disabled:bg-teal-300"
          type="button"
          :disabled="isRendering"
          @click="handleConvert"
        >
          {{ isRendering ? 'Rendering...' : 'Convert' }}
        </button>
      </div>

      <div class="mt-6 rounded-lg bg-white p-5 shadow">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-700">Visualization</p>
            <p class="text-xs text-gray-500">Switch among 9 constructions from the paper</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in automatonTabs"
              :key="t.key"
              class="rounded-full px-3 py-1 text-xs font-semibold transition"
              :class="activeTab === t.key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'"
              type="button"
              @click="onTabChange(t.key)"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <div class="mt-2 text-xs text-red-600 font-semibold" v-if="errorMessage">
          {{ errorMessage }}
        </div>
        <div class="mt-3 rounded-lg border border-teal-100 bg-white px-3 py-4">
          <div class="relative">
            <div
              ref="vizContainer"
              class="min-h-[360px] overflow-auto"
              aria-label="Graph visualization"
            />
            <div
              v-if="isRendering"
              class="absolute inset-0 flex items-center justify-center bg-white/70"
              aria-live="polite"
            >
              <div class="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow">
                <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></span>
                <span class="text-xs font-semibold text-teal-700">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-8 rounded-lg bg-white p-5 shadow">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Quiver Diagram Editor</h2>
            <p class="text-sm text-gray-600">
              Embedded Quiver tool for quick category theory diagrams.
            </p>
          </div>
          <a
            class="text-sm font-semibold text-teal-700 hover:text-teal-900"
            href="https://q.uiver.app/"
            target="_blank"
            rel="noreferrer"
          >
            Open in new tab
          </a>
        </div>
        <div class="mt-4 overflow-hidden rounded-lg border border-gray-200 shadow-inner">
          <iframe
            title="Quiver Diagram Editor"
            src="https://q.uiver.app/"
            allow="clipboard-write"
            class="h-[480px] w-full border-0"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const regexInput = ref('(a+b)*a');
const examples = ['(a+b)*a', '(b+ab)*+b*', 'a*b*a*', '(a+b)c*', '(a+b)*'];
const vizContainer = ref(null);
const isRendering = ref(false);
const errorMessage = ref('');
const activeTab = ref('apos');

const automatonTabs = [
  { key: 'apos', label: 'A_POS (NFA)' },
  { key: 'follow', label: 'AF (Follow)' },
  { key: 'my', label: 'A_MY (McNaughton-Yamada)' },
  { key: 'mb', label: 'A_MB (Mark Before)' },
  { key: 'pd', label: 'A_PD (Partial Deriv.)' },
  { key: 'brz', label: 'A_B (Brzozowski)' },
  { key: 'pref', label: 'A_Pre (Prefix)' },
  { key: 'dpos', label: 'A_Dual_POS' },
  { key: 'dpref', label: 'A_Dual_Pre' },
];

// --- Regex parsing and automata construction ---
const OPERATORS = {
  '+': { prec: 1, assoc: 'L' },
  '.': { prec: 2, assoc: 'L' }, // explicit concatenation
  '*': { prec: 3, assoc: 'R', unary: true },
};

const isSymbolChar = (ch) => /[a-zA-Z0-9]/.test(ch);

const tokenize = (input) => {
  const tokens = [];
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === '\\') {
      const next = input[i + 1];
      if (next === 'e') {
        tokens.push({ type: 'eps', value: 'ε' });
        i += 1;
      } else if (next === '0') {
        tokens.push({ type: 'empty', value: '∅' });
        i += 1;
      } else {
        tokens.push({ type: 'sym', value: next });
        i += 1;
      }
    } else if (ch === '_') {
      tokens.push({ type: 'eps', value: 'ε' });
    } else if (isSymbolChar(ch)) {
      tokens.push({ type: 'sym', value: ch });
    } else if (['+', '*', '(', ')'].includes(ch)) {
      tokens.push({ type: 'op', value: ch });
    } else if (/\s/.test(ch)) {
      continue;
    } else {
      // unsupported character
      tokens.push({ type: 'sym', value: ch });
    }
  }
  // insert explicit concatenation
  const output = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const cur = tokens[i];
    output.push(cur);
    if (i === tokens.length - 1) continue;
    const next = tokens[i + 1];
    const curCat =
      cur.type === 'sym' ||
      cur.type === 'eps' ||
      cur.type === 'empty' ||
      (cur.type === 'op' && cur.value === ')') ||
      (cur.type === 'op' && cur.value === '*');
    const nextCat =
      next.type === 'sym' ||
      next.type === 'eps' ||
      next.type === 'empty' ||
      (next.type === 'op' && next.value === '(');
    if (curCat && nextCat) {
      output.push({ type: 'op', value: '.' });
    }
  }
  return output;
};

const toPostfix = (tokens) => {
  const out = [];
  const stack = [];
  tokens.forEach((t) => {
    if (t.type === 'sym' || t.type === 'eps' || t.type === 'empty') {
      out.push(t);
    } else if (t.type === 'op') {
      const op = t.value;
      if (op === '(') {
        stack.push(op);
      } else if (op === ')') {
        while (stack.length && stack[stack.length - 1] !== '(') {
          out.push({ type: 'op', value: stack.pop() });
        }
        if (!stack.length) {
          throw new Error('Mismatched parentheses.');
        }
        stack.pop();
      } else {
        while (
          stack.length &&
          stack[stack.length - 1] !== '(' &&
          ((OPERATORS[op].assoc === 'L' &&
            OPERATORS[op].prec <= OPERATORS[stack[stack.length - 1]].prec) ||
            (OPERATORS[op].assoc === 'R' &&
              OPERATORS[op].prec < OPERATORS[stack[stack.length - 1]].prec))
        ) {
          out.push({ type: 'op', value: stack.pop() });
        }
        stack.push(op);
      }
    }
  });
  while (stack.length) {
    if (stack[stack.length - 1] === '(') {
      throw new Error('Mismatched parentheses.');
    }
    out.push({ type: 'op', value: stack.pop() });
  }
  return out;
};

const buildAst = (postfix) => {
  const stack = [];
  postfix.forEach((t) => {
    if (t.type === 'sym') {
      stack.push({ kind: 'sym', sym: t.value });
    } else if (t.type === 'eps') {
      stack.push({ kind: 'eps' });
    } else if (t.type === 'empty') {
      stack.push({ kind: 'empty' });
    } else if (t.type === 'op') {
      if (t.value === '*') {
        const a = stack.pop();
        if (!a) {
          throw new Error('Invalid operator usage.');
        }
        stack.push({ kind: 'star', child: a });
      } else if (t.value === '+') {
        const b = stack.pop();
        const a = stack.pop();
        if (!a || !b) {
          throw new Error('Invalid operator usage.');
        }
        stack.push({ kind: 'union', left: a, right: b });
      } else if (t.value === '.') {
        const b = stack.pop();
        const a = stack.pop();
        if (!a || !b) {
          throw new Error('Invalid operator usage.');
        }
        stack.push({ kind: 'concat', left: a, right: b });
      }
    }
  });
  if (stack.length !== 1) {
    throw new Error('Invalid expression.');
  }
  return stack.pop();
};

const markPositions = (node, start = 1, posMap = {}) => {
  if (!node) return { node, next: start, posMap };
  if (node.kind === 'sym') {
    const idx = start;
    const marked = { ...node, pos: idx };
    posMap[idx] = node.sym;
    return { node: marked, next: start + 1, posMap };
  }
  if (node.kind === 'eps' || node.kind === 'empty') {
    return { node, next: start, posMap };
  }
  if (node.kind === 'star') {
    const { node: child, next, posMap: pm } = markPositions(node.child, start, posMap);
    return { node: { ...node, child }, next, posMap: pm };
  }
  const { node: l, next: n1, posMap: pm1 } = markPositions(node.left, start, posMap);
  const { node: r, next: n2, posMap: pm2 } = markPositions(node.right, n1, pm1);
  return { node: { ...node, left: l, right: r }, next: n2, posMap: pm2 };
};

const setUnion = (a, b) => new Set([...a, ...b]);

const nullableFirstLast = (node) => {
  if (!node) return { nullable: false, first: new Set(), last: new Set(), follow: new Map() };
  if (node.kind === 'sym') {
    return {
      nullable: false,
      first: new Set([node.pos]),
      last: new Set([node.pos]),
      follow: new Map(),
    };
  }
  if (node.kind === 'eps') {
    return { nullable: true, first: new Set(), last: new Set(), follow: new Map() };
  }
  if (node.kind === 'empty') {
    return { nullable: false, first: new Set(), last: new Set(), follow: new Map() };
  }
  if (node.kind === 'union') {
    const L = nullableFirstLast(node.left);
    const R = nullableFirstLast(node.right);
    const follow = new Map([...L.follow, ...R.follow]);
    return {
      nullable: L.nullable || R.nullable,
      first: setUnion(L.first, R.first),
      last: setUnion(L.last, R.last),
      follow,
    };
  }
  if (node.kind === 'concat') {
    const L = nullableFirstLast(node.left);
    const R = nullableFirstLast(node.right);
    const follow = new Map([...L.follow, ...R.follow]);
    L.last.forEach((i) => {
      const cur = follow.get(i) || new Set();
      R.first.forEach((f) => cur.add(f));
      follow.set(i, cur);
    });
    return {
      nullable: L.nullable && R.nullable,
      first: L.nullable ? setUnion(L.first, R.first) : L.first,
      last: R.nullable ? setUnion(R.last, L.last) : R.last,
      follow,
    };
  }
  if (node.kind === 'star') {
    const C = nullableFirstLast(node.child);
    const follow = new Map(C.follow);
    C.last.forEach((i) => {
      const cur = follow.get(i) || new Set();
      C.first.forEach((f) => cur.add(f));
      follow.set(i, cur);
    });
    return {
      nullable: true,
      first: C.first,
      last: C.last,
      follow,
    };
  }
  return { nullable: false, first: new Set(), last: new Set(), follow: new Map() };
};

const buildPositionAutomaton = (ast) => {
  const { nullable, first, last, follow } = nullableFirstLast(ast);
  const followAll = new Map(follow);
  followAll.set(0, new Set(first));
  const maxPos =
    Array.from(new Set([...first, ...last, ...[...followAll.values()].flat()])).reduce(
      (m, v) => Math.max(m, v),
      0,
    );
  const states = Array.from({ length: maxPos + 1 }, (_, i) => i);
  const finals = new Set(last);
  if (nullable) finals.add(0);
  return { states, finals, follow: followAll, nullable };
};

const buildMBAutomaton = (ast, symbolMap) => {
  const { nullable, first, last, follow } = nullableFirstLast(ast);
  const followAll = new Map(follow);
  followAll.set(0, new Set(first));
  const alphabet = Array.from(new Set(Object.values(symbolMap)));

  const key = (S, c) => `${[...S].sort((a, b) => a - b).join(',')}|${c ? '1' : '0'}`;
  const queue = [];
  const visited = new Map();

  const startState = { S: new Set(first), c: nullable };
  visited.set(key(startState.S, startState.c), startState);
  queue.push(startState);

  const transitions = [];
  const finals = new Set();

  const isFinal = (S, c) => {
    if (c) return true;
    for (const x of S) {
      if (last.has(x)) return true;
    }
    return false;
  };

  while (queue.length) {
    const cur = queue.shift();
    if (isFinal(cur.S, cur.c)) {
      finals.add(key(cur.S, cur.c));
    }
    alphabet.forEach((sym) => {
      const select = Array.from(cur.S).filter((p) => symbolMap[p] === sym);
      if (!select.length) return;
      const nextSet = new Set();
      select.forEach((p) => {
        const fset = followAll.get(p) || new Set();
        fset.forEach((x) => nextSet.add(x));
      });
      const nextC = false; // select contains only symbols, not eps
      const nextState = { S: nextSet, c: nextC };
      const k = key(nextState.S, nextState.c);
      if (!visited.has(k)) {
        visited.set(k, nextState);
        queue.push(nextState);
      }
      transitions.push({ from: key(cur.S, cur.c), to: k, label: sym });
    });
  }

  return {
    states: Array.from(visited.keys()),
    finals,
    transitions,
    start: key(startState.S, startState.c),
  };
};

const formatSetLabel = (stateKey) => {
  const [setPart, cPart] = stateKey.split('|');
  const entries = setPart ? setPart.split(',').filter((x) => x !== '') : [];
  return `{${entries.join(',')}}${cPart === '1' ? ', ε' : ''}`;
};

const baseBuild = (regex) => {
  const tokens = tokenize(regex);
  const postfix = toPostfix(tokens);
  const astRaw = buildAst(postfix);
  const { node: ast, posMap } = markPositions(astRaw);
  const pos = buildPositionAutomaton(ast);
  const nfaData = nullableFirstLast(ast);
  const alphabet = Array.from(new Set(Object.values(posMap)));
  return { ast, posMap, pos, nfaData, alphabet, tokens, postfix };
};

const buildPosDot = (regex, pos, posMap) => {
  const edges = [];
  (pos.follow.get(0) || []).forEach((j) => {
    edges.push(`  0 -> ${j} [label="${posMap[j]}"];`);
  });
  pos.follow.forEach((set, i) => {
    if (i === 0) return;
    set.forEach((j) => edges.push(`  ${i} -> ${j} [label="${posMap[j]}"];`));
  });
  const finals = Array.from(pos.finals).map((f) => `${f}`);
  const nodeDecl = pos.states
    .map((s) => {
      const per = finals.includes(`${s}`) ? ' peripheries=2' : '';
      return `  ${s} [label="${s}"${per}];`;
    })
    .join('\n');
  const label = regex || 'ε';
  return {
    dot: `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_POS for: ${label.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=circle, style=filled, fillcolor="#e0f2f1", color="#009688", fontcolor="#004d40"];
  edge [color="#00695c", penwidth=2, arrowsize=0.8];
${nodeDecl}
  start [shape=point, color="#009688"];
  start -> 0;
${edges.join('\n')}
}
    `,
    posMap,
  };
};

const buildMbDot = (regex, posMap, ast) => {
  const mb = buildMBAutomaton(ast, posMap);
  const nodes = mb.states
    .map((k) => {
      const per = mb.finals.has(k) ? ' peripheries=2' : '';
      return `  "${k}" [label="${formatSetLabel(k)}"${per}];`;
    })
    .join('\n');
  const edges = mb.transitions
    .map((t) => `  "${t.from}" -> "${t.to}" [label="${t.label}"];`)
    .join('\n');
  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_MB for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=circle, style=filled, fillcolor="#e8f5e9", color="#43a047", fontcolor="#1b5e20"];
  edge [color="#2e7d32", penwidth=2, arrowsize=0.8];
${nodes}
  start [shape=point, color="#43a047"];
  start -> "${mb.start}";
${edges}
}
`;
};

const svgByType = ref({});
const dotByType = ref({});
const parsedCache = ref({ expr: '', data: null });
const renderSeq = ref(0);
const vizWorker = ref(null);
const workerSeq = ref(0);
const MAX_AUTOMATON_STATES = 400;
const MAX_AUTOMATON_EDGES = 2000;

// --- Additional automata ---
const buildFollowDot = (regex, pos, posMap, nfaData) => {
  const eps = (i) => {
    if (i === 0) return nfaData.nullable;
    return nfaData.last.has(i);
  };
  const states = Array.from(pos.follow.keys()).map((i) => ({
    i,
    key: `${Array.from(pos.follow.get(i) || []).sort((a, b) => a - b).join(',')}|${eps(i) ? '1' : '0'}`,
    set: pos.follow.get(i) || new Set(),
    isFinal: eps(i),
  }));
  const nodeLines = states
    .map((s) => {
      const per = s.isFinal ? ' peripheries=2' : '';
      return `  "${s.key}" [label="{${Array.from(s.set).join(',')}}${s.isFinal ? ', ε' : ''}"${per}];`;
    })
    .join('\n');
  const edges = [];
  states.forEach((s) => {
    const set = s.set;
    const seen = new Map();
    set.forEach((p) => {
      const sym = posMap[p];
      const followSet = pos.follow.get(p) || new Set();
      const key = `${Array.from(followSet).sort((a, b) => a - b).join(',')}|${eps(p) ? '1' : '0'}`;
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key).add(sym);
    });
    seen.forEach((syms, k) => {
      edges.push(`  "${s.key}" -> "${k}" [label="${Array.from(syms).join(', ')}"];`);
    });
  });
  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="AF (Follow) for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=ellipse, style=filled, fillcolor="#fff3e0", color="#fb8c00", fontcolor="#e65100"];
  edge [color="#ef6c00", penwidth=2, arrowsize=0.8];
${nodeLines}
${edges.join('\n')}
}
`;
};

const buildMyDot = (regex, pos, posMap, posFinals) => {
  const alphabet = Array.from(new Set(Object.values(posMap)));
  const finals = posFinals;
  const start = new Set([0]);
  const key = (S) => `{${Array.from(S).sort((a, b) => a - b).join(',')}}`;
  const queue = [start];
  const visited = new Set([key(start)]);
  const edges = [];
  const nodes = [];
  while (queue.length) {
    const cur = queue.shift();
    const curKey = key(cur);
    const isFinal = Array.from(cur).some((x) => finals.has(x));
    nodes.push({ k: curKey, final: isFinal });
    alphabet.forEach((sym) => {
      const nextSet = new Set();
      cur.forEach((p) => {
        const fset = pos.follow.get(p) || new Set();
        fset.forEach((j) => {
          if (posMap[j] === sym) nextSet.add(j);
        });
      });
      if (nextSet.size === 0) return;
      const nk = key(nextSet);
      edges.push(`  "${curKey}" -> "${nk}" [label="${sym}"];`);
      if (!visited.has(nk)) {
        visited.add(nk);
        queue.push(nextSet);
      }
    });
  }
  const nodeLines = nodes
    .map((n) => `  "${n.k}" [label="${n.k}"${n.final ? ' peripheries=2' : ''}];`)
    .join('\n');
  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_MY (determinization of A_POS) for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=circle, style=filled, fillcolor="#e3f2fd", color="#1e88e5", fontcolor="#0d47a1"];
  edge [color="#1976d2", penwidth=2, arrowsize=0.8];
${nodeLines}
  start [shape=point, color="#1e88e5"];
  start -> "${key(start)}";
${edges.join('\n')}
}
`;
};

const astToString = (node) => {
  if (!node) return '∅';
  switch (node.kind) {
    case 'sym':
      return node.sym;
    case 'eps':
      return 'ε';
    case 'empty':
      return '∅';
    case 'star':
      return `(${astToString(node.child)})*`;
    case 'union':
      return `(${astToString(node.left)}+${astToString(node.right)})`;
    case 'concat':
      return `(${astToString(node.left)}${astToString(node.right)})`;
    default:
      return '∅';
  }
};

const isNullable = (node) => nullableFirstLast(node).nullable;

const cloneAst = (node) => JSON.parse(JSON.stringify(node));

const makeEps = () => ({ kind: 'eps' });
const makeSym = (sym) => ({ kind: 'sym', sym });

const concatAst = (left, right) => {
  if (!left || !right) return { kind: 'empty' };
  if (left.kind === 'empty' || right.kind === 'empty') return { kind: 'empty' };
  if (left.kind === 'eps') return right;
  if (right.kind === 'eps') return left;
  return { kind: 'concat', left, right };
};

const unionPairs = (pairs) => {
  const map = new Map();
  pairs.forEach((p) => {
    const key = `${astToString(p.prefix)}|${p.sym}`;
    if (!map.has(key)) map.set(key, p);
  });
  return Array.from(map.values());
};

const rCache = new Map();
const rPairs = (node) => {
  const key = astToString(node);
  if (rCache.has(key)) return rCache.get(key);
  let result = [];
  if (!node || node.kind === 'empty' || node.kind === 'eps') {
    result = [];
  } else if (node.kind === 'sym') {
    result = [{ prefix: makeEps(), sym: node.sym }];
  } else if (node.kind === 'union') {
    result = unionPairs([...rPairs(node.left), ...rPairs(node.right)]);
  } else if (node.kind === 'concat') {
    const rightPairs = rPairs(node.right).map((p) => ({
      prefix: concatAst(cloneAst(node.left), cloneAst(p.prefix)),
      sym: p.sym,
    }));
    const leftPairs = isNullable(node.right) ? rPairs(node.left) : [];
    result = unionPairs([...rightPairs, ...leftPairs]);
  } else if (node.kind === 'star') {
    const childPairs = rPairs(node.child).map((p) => ({
      prefix: concatAst(cloneAst(node), cloneAst(p.prefix)),
      sym: p.sym,
    }));
    result = unionPairs(childPairs);
  }
  rCache.set(key, result);
  return result;
};

const lCache = new Map();
const lPairs = (node) => {
  const key = astToString(node);
  if (lCache.has(key)) return lCache.get(key);
  let result = [];
  if (!node || node.kind === 'empty' || node.kind === 'eps') {
    result = [];
  } else if (node.kind === 'sym') {
    result = [{ sym: node.sym, suffix: makeEps() }];
  } else if (node.kind === 'union') {
    result = unionPairs(
      [...lPairs(node.left), ...lPairs(node.right)].map((p) => ({
        prefix: p.suffix,
        sym: p.sym,
      })),
    ).map((p) => ({ sym: p.sym, suffix: p.prefix }));
  } else if (node.kind === 'concat') {
    const leftPairs = lPairs(node.left).map((p) => ({
      sym: p.sym,
      suffix: concatAst(cloneAst(p.suffix), cloneAst(node.right)),
    }));
    const rightPairs = isNullable(node.left) ? lPairs(node.right) : [];
    result = unionPairs(
      [...leftPairs, ...rightPairs].map((p) => ({
        prefix: p.suffix,
        sym: p.sym,
      })),
    ).map((p) => ({ sym: p.sym, suffix: p.prefix }));
  } else if (node.kind === 'star') {
    const childPairs = lPairs(node.child).map((p) => ({
      sym: p.sym,
      suffix: concatAst(cloneAst(p.suffix), cloneAst(node)),
    }));
    result = unionPairs(
      childPairs.map((p) => ({
        prefix: p.suffix,
        sym: p.sym,
      })),
    ).map((p) => ({ sym: p.sym, suffix: p.prefix }));
  }
  lCache.set(key, result);
  return result;
};

const pd = (node, sym) => {
  if (!node) return [];
  if (node.kind === 'empty') return [];
  if (node.kind === 'eps') return [];
  if (node.kind === 'sym') return node.sym === sym ? [{ kind: 'eps' }] : [];
  if (node.kind === 'union') {
    return [...pd(node.left, sym), ...pd(node.right, sym)];
  }
  if (node.kind === 'concat') {
    const left = pd(node.left, sym).map((d) => ({ kind: 'concat', left: d, right: cloneAst(node.right) }));
    if (isNullable(node.left)) {
      return [...left, ...pd(node.right, sym)];
    }
    return left;
  }
  if (node.kind === 'star') {
    return pd(node.child, sym).map((d) => ({ kind: 'concat', left: d, right: cloneAst(node) }));
  }
  return [];
};

const pdKey = (nodes) => {
  const strs = nodes.map((n) => astToString(n));
  const uniq = Array.from(new Set(strs)).sort();
  return uniq.join(' | ') || '∅';
};

const buildPdDot = (regex, ast, alphabet) => {
  const startSet = [ast];
  const queue = [startSet];
  const visited = new Set([pdKey(startSet)]);
  const edges = [];
  const nodes = [];
  while (queue.length) {
    const cur = queue.shift();
    const curKey = pdKey(cur);
    const isFinal = cur.some((n) => isNullable(n));
    nodes.push({ k: curKey, final: isFinal });
    alphabet.forEach((sym) => {
      const next = [];
      cur.forEach((n) => {
        next.push(...pd(n, sym));
      });
      if (!next.length) return;
      const nk = pdKey(next);
      edges.push(`  "${curKey}" -> "${nk}" [label="${sym}"];`);
      if (edges.length > MAX_AUTOMATON_EDGES) {
        throw new Error('Automaton too large.');
      }
      if (!visited.has(nk)) {
        visited.add(nk);
        if (visited.size > MAX_AUTOMATON_STATES) {
          throw new Error('Automaton too large.');
        }
        queue.push(next);
      }
    });
  }
  const nodeLines = nodes
    .map((n) => `  "${n.k}" [label="${n.k}"${n.final ? ' peripheries=2' : ''}];`)
    .join('\n');
  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_PD (partial derivatives) for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=box, style=filled, fillcolor="#f3e5f5", color="#8e24aa", fontcolor="#4a148c"];
  edge [color="#6a1b9a", penwidth=2, arrowsize=0.8];
${nodeLines}
${edges.join('\n')}
}
`;
};

const brz = (node, sym) => {
  if (!node) return { kind: 'empty' };
  if (node.kind === 'empty') return { kind: 'empty' };
  if (node.kind === 'eps') return { kind: 'empty' };
  if (node.kind === 'sym') return node.sym === sym ? { kind: 'eps' } : { kind: 'empty' };
  if (node.kind === 'union') {
    return { kind: 'union', left: brz(node.left, sym), right: brz(node.right, sym) };
  }
  if (node.kind === 'concat') {
    if (isNullable(node.left)) {
      return {
        kind: 'union',
        left: { kind: 'concat', left: brz(node.left, sym), right: cloneAst(node.right) },
        right: brz(node.right, sym),
      };
    }
    return { kind: 'concat', left: brz(node.left, sym), right: cloneAst(node.right) };
  }
  if (node.kind === 'star') {
    return { kind: 'concat', left: brz(node.child, sym), right: cloneAst(node) };
  }
  return { kind: 'empty' };
};

const buildBrzDot = (regex, ast, alphabet) => {
  const start = ast;
  const queue = [start];
  const visited = new Set([astToString(start)]);
  const edges = [];
  const nodes = [];
  while (queue.length) {
    const cur = queue.shift();
    const curKey = astToString(cur);
    const isFinal = isNullable(cur);
    nodes.push({ k: curKey, final: isFinal });
    alphabet.forEach((sym) => {
      const next = brz(cur, sym);
      const nk = astToString(next);
      if (nk === '∅') return;
      edges.push(`  "${curKey}" -> "${nk}" [label="${sym}"];`);
      if (edges.length > MAX_AUTOMATON_EDGES) {
        throw new Error('Automaton too large.');
      }
      if (!visited.has(nk)) {
        visited.add(nk);
        if (visited.size > MAX_AUTOMATON_STATES) {
          throw new Error('Automaton too large.');
        }
        queue.push(next);
      }
    });
  }
  const nodeLines = nodes
    .map((n) => `  "${n.k}" [label="${n.k}"${n.final ? ' peripheries=2' : ''}];`)
    .join('\n');
  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_B (Brzozowski derivatives) for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=box, style=filled, fillcolor="#e8f5e9", color="#2e7d32", fontcolor="#1b5e20"];
  edge [color="#1b5e20", penwidth=2, arrowsize=0.8];
${nodeLines}
${edges.join('\n')}
}
`;
};

const buildPreDot = (regex, ast) => {
  const stateMap = new Map();
  const edgeLines = [];
  const queue = [];
  const pairSeen = new Set();

  const addState = (expr) => {
    const key = astToString(expr);
    if (!stateMap.has(key)) stateMap.set(key, expr);
    return key;
  };

  const makeExprFromPair = (pair) => concatAst(cloneAst(pair.prefix), makeSym(pair.sym));

  const addPairToQueue = (pair) => {
    const key = `${astToString(pair.prefix)}|${pair.sym}`;
    if (pairSeen.has(key)) return;
    pairSeen.add(key);
    queue.push(pair);
  };

  const initialKey = addState(makeEps());
  rPairs(ast).forEach((pair) => {
    addState(makeExprFromPair(pair));
    addPairToQueue(pair);
  });

  while (queue.length) {
    const current = queue.shift();
    const currentExpr = makeExprFromPair(current);
    const currentKey = addState(currentExpr);
    const prefix = current.prefix;
    const preds = rPairs(prefix);
    preds.forEach((p) => {
      const predExpr = makeExprFromPair(p);
      const predKey = addState(predExpr);
      edgeLines.push(`  "${predKey}" -> "${currentKey}" [label="${current.sym}"];`);
      addPairToQueue(p);
    });
    if (isNullable(prefix)) {
      edgeLines.push(`  "${initialKey}" -> "${currentKey}" [label="${current.sym}"];`);
    }
  }

  const finalKeys = new Set();
  rPairs(ast).forEach((pair) => {
    finalKeys.add(astToString(makeExprFromPair(pair)));
  });
  if (isNullable(ast)) {
    finalKeys.add(astToString(makeEps()));
  }

  const nodeLines = Array.from(stateMap.keys())
    .map((k) => {
      const per = finalKeys.has(k) ? ' peripheries=2' : '';
      return `  "${k}" [label="${k}"${per}];`;
    })
    .join('\n');

  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_Pre for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=circle, style=filled, fillcolor="#fff8e1", color="#f9a825", fontcolor="#6d4c41"];
  edge [color="#f57f17", penwidth=2, arrowsize=0.8];
  start [shape=point, color="#f9a825"];
  start -> "${initialKey}";
${nodeLines}
${edgeLines.join('\n')}
}
`;
};

const buildDualPosDot = (regex, pos, posMap, nfaData) => {
  const positions = Object.keys(posMap)
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  const maxPos = positions.length ? Math.max(...positions) : 0;
  const endState = maxPos + 1;
  const initSet = new Set(pos.follow.get(0) || []);
  if (nfaData.nullable) initSet.add(endState);

  const edges = [];
  positions.forEach((i) => {
    const targets = new Set(pos.follow.get(i) || []);
    if (nfaData.last.has(i)) targets.add(endState);
    if (!targets.size) return;
    const label = posMap[i];
    targets.forEach((t) => {
      edges.push(`  ${i} -> ${t} [label="${label}"];`);
    });
  });

  const nodeLines = [...positions, endState]
    .map((s) => {
      const per = s === endState ? ' peripheries=2' : '';
      return `  ${s} [label="${s}"${per}];`;
    })
    .join('\n');

  const startEdges = Array.from(initSet).map((s) => `  start -> ${s};`).join('\n');

  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_Dual_POS for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=circle, style=filled, fillcolor="#ede7f6", color="#5e35b1", fontcolor="#311b92"];
  edge [color="#512da8", penwidth=2, arrowsize=0.8];
${nodeLines}
  start [shape=point, color="#5e35b1"];
${startEdges}
${edges.join('\n')}
}
`;
};

const buildDualPrefixDot = (regex, ast, alphabet) => {
  const stateMap = new Map();
  const exprMap = new Map();
  const queue = [];
  const edges = [];

  const exprKey = (expr) => astToString(expr);

  const lEpsilonSet = (node) => {
    const set = new Map();
    lPairs(node).forEach((p) => {
      const expr = concatAst(makeSym(p.sym), cloneAst(p.suffix));
      const key = exprKey(expr);
      if (!set.has(key)) set.set(key, expr);
    });
    if (isNullable(node)) {
      const e = makeEps();
      const k = exprKey(e);
      if (!set.has(k)) set.set(k, e);
    }
    return set;
  };

  const addState = (setMap) => {
    const keys = Array.from(setMap.keys()).sort();
    const key = keys.join(' | ') || '∅';
    if (!stateMap.has(key)) {
      stateMap.set(key, keys);
      keys.forEach((k) => {
        if (!exprMap.has(k)) exprMap.set(k, setMap.get(k));
      });
      queue.push(key);
    }
    return key;
  };

  const startSet = lEpsilonSet(ast);
  const startKey = addState(startSet);

  while (queue.length) {
    const stateKey = queue.shift();
    const exprKeys = stateMap.get(stateKey) || [];
    const exprs = exprKeys.map((k) => exprMap.get(k)).filter(Boolean);
    alphabet.forEach((sym) => {
      const nextSet = new Map();
      exprs.forEach((expr) => {
        const pairs = lPairs(expr);
        pairs.forEach((p) => {
          if (p.sym !== sym) return;
          const ext = lEpsilonSet(p.suffix);
          ext.forEach((v, k) => {
            if (!nextSet.has(k)) nextSet.set(k, v);
          });
        });
      });
      if (!nextSet.size) return;
      const nextKey = addState(nextSet);
      edges.push(`  "${stateKey}" -> "${nextKey}" [label="${sym}"];`);
    });
  }

  const finalKeys = new Set();
  stateMap.forEach((keys, key) => {
    if (keys.includes('ε')) finalKeys.add(key);
  });

  const nodeLines = Array.from(stateMap.keys())
    .map((k) => {
      const per = finalKeys.has(k) ? ' peripheries=2' : '';
      return `  "${k}" [label="${k}"${per}];`;
    })
    .join('\n');

  return `
digraph {
  rankdir=LR;
  labelloc="t";
  label="A_Dual_Pre for: ${regex.replace(/"/g, '\\"')}";
  fontsize=14;
  node [shape=box, style=filled, fillcolor="#e0f7fa", color="#00838f", fontcolor="#004d40"];
  edge [color="#006064", penwidth=2, arrowsize=0.8];
${nodeLines}
  start [shape=point, color="#00838f"];
  start -> "${startKey}";
${edges.join('\n')}
}
`;
};

const getDotForTab = (tab, expr, data) => {
  const { ast, posMap, pos, nfaData, alphabet } = data;
  switch (tab) {
    case 'apos':
      return buildPosDot(expr, pos, posMap).dot;
    case 'follow':
      return buildFollowDot(expr, pos, posMap, nfaData);
    case 'my':
      return buildMyDot(expr, pos, posMap, pos.finals);
    case 'mb':
      return buildMbDot(expr, posMap, ast);
    case 'pd':
      return buildPdDot(expr, ast, alphabet);
    case 'brz':
      return buildBrzDot(expr, ast, alphabet);
    case 'pref':
      return buildPreDot(expr, ast);
    case 'dpos':
      return buildDualPosDot(expr, pos, posMap, nfaData);
    case 'dpref':
      return buildDualPrefixDot(expr, ast, alphabet);
    default:
      return buildPosDot(expr, pos, posMap).dot;
  }
};

const parseExpression = (expr) => {
  const trimmed = expr.trim() || 'ε';
  const data = baseBuild(trimmed);
  return { expr: trimmed, data };
};

const ensureVizWorker = () => {
  if (!vizWorker.value) {
    vizWorker.value = new Worker(new URL('./viz.worker.js', import.meta.url), { type: 'module' });
  }
  return vizWorker.value;
};

const renderDotWithWorker = (dot, timeoutMs = 12000) =>
  new Promise((resolve, reject) => {
    const worker = ensureVizWorker();
    const id = workerSeq.value + 1;
    workerSeq.value = id;
    const timer = setTimeout(() => {
      worker.terminate();
      vizWorker.value = null;
      reject(new Error('Render timeout'));
    }, timeoutMs);

    const handleMessage = (event) => {
      const payload = event.data || {};
      if (payload.id !== id) return;
      clearTimeout(timer);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      if (payload.error) {
        reject(new Error(payload.error));
        return;
      }
      resolve(payload.svg);
    };

    const handleError = (err) => {
      clearTimeout(timer);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
      vizWorker.value = null;
      reject(err);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.postMessage({ id, dot });
  });

const renderActive = async (expression, tab = activeTab.value) => {
  if (!vizContainer.value) return;
  isRendering.value = true;
  errorMessage.value = '';
  const expr = expression.trim() || 'ε';
  const seq = renderSeq.value + 1;
  renderSeq.value = seq;
  try {
    if (vizWorker.value) {
      vizWorker.value.terminate();
      vizWorker.value = null;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (parsedCache.value.expr !== expr) {
      parsedCache.value = parseExpression(expr);
      dotByType.value = {};
      svgByType.value = {};
    }
    const { data } = parsedCache.value;
    if (!dotByType.value[tab]) {
      dotByType.value[tab] = getDotForTab(tab, expr, data);
    }
    const svg = await renderDotWithWorker(dotByType.value[tab]);
    if (renderSeq.value !== seq) return;
    svgByType.value[tab] = svg;
    vizContainer.value.innerHTML = svg;
  } catch (err) {
    if (err instanceof Error && err.message.includes('Automaton too large')) {
      errorMessage.value = 'Automaton too large to render safely.';
    } else {
      errorMessage.value = 'Unable to build automata. Please check the regex.';
    }
    vizContainer.value.innerHTML = '';
    console.error(err);
  } finally {
    isRendering.value = false;
  }
};

const handleConvert = () => {
  renderActive(regexInput.value, activeTab.value);
};

const applyExample = (example) => {
  regexInput.value = example;
};

const onTabChange = (tab) => {
  activeTab.value = tab;
  if (svgByType.value[tab]) {
    vizContainer.value.innerHTML = svgByType.value[tab];
    return;
  }
  renderActive(regexInput.value, tab);
};

onMounted(() => {
  handleConvert();
});
</script>

