/*
 * A pipe puzzle, and the page around it.
 *
 * The puzzle exists so the database has something real to hold. Every completed
 * level is a row, the rows are read back and shown underneath, and they survive
 * a redeploy because they are not in the container. That is the whole lesson,
 * and it is easier to feel than to read.
 */

const DIRS = [
  { bit: 1, dr: -1, dc: 0, opp: 4 }, // north
  { bit: 2, dr: 0, dc: 1, opp: 8 },  // east
  { bit: 4, dr: 1, dc: 0, opp: 1 },  // south
  { bit: 8, dr: 0, dc: -1, opp: 2 }, // west
];

/** Rotating a mask clockwise moves every connector one position round. */
function rotate(mask, times) {
  let m = mask;
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) {
    m = ((m << 1) | (m >> 3)) & 0b1111;
  }
  return m;
}

const state = {
  level: 1,
  size: 4,
  cells: [],
  moves: 0,
  startedAt: null,
  timer: null,
  solved: false,
};

/* Generation ---------------------------------------------------------------
 *
 * A random path is walked from the top left to the bottom right first, and the
 * pieces are derived from it, so the board is solvable by construction. Filling
 * a grid with random pieces and hoping is how you ship an unsolvable level.
 */
function generate(size) {
  const cells = Array.from({ length: size * size }, () => ({ mask: 0, rot: 0, fixed: false }));
  const idx = (r, c) => r * size + c;

  const path = [[0, 0]];
  let r = 0;
  let c = 0;
  while (r !== size - 1 || c !== size - 1) {
    const options = [];
    if (r < size - 1) options.push([r + 1, c]);
    if (c < size - 1) options.push([r, c + 1]);
    // A short bias upward keeps the route from hugging the diagonal.
    if (r > 0 && Math.random() < 0.18 && !path.some(([pr, pc]) => pr === r - 1 && pc === c)) {
      options.push([r - 1, c]);
    }
    const [nr, nc] = options[Math.floor(Math.random() * options.length)];
    path.push([nr, nc]);
    r = nr;
    c = nc;
  }

  for (let i = 0; i < path.length; i++) {
    const [pr, pc] = path[i];
    const cell = cells[idx(pr, pc)];
    for (const [or, oc] of [path[i - 1], path[i + 1]].filter(Boolean)) {
      const d = DIRS.find((x) => pr + x.dr === or && pc + x.dc === oc);
      if (d) cell.mask |= d.bit;
    }
  }

  // Decoys everywhere the path did not reach, so the shape of the answer is
  // not simply the set of non-empty tiles.
  for (const cell of cells) {
    if (cell.mask === 0) cell.mask = [0b0011, 0b0101, 0b0111, 0b0001][Math.floor(Math.random() * 4)];
  }

  cells[0].fixed = true;
  cells[cells.length - 1].fixed = true;

  // Now scramble, and reject a scramble that happens to leave the two ends
  // already joined. On a four by four that lands about once in two hundred
  // boards, and the level would then be won by the first click on anything.
  // Bounded, because a loop that cannot fail is still a loop.
  for (let attempt = 0; attempt < 40; attempt++) {
    for (const cell of cells) {
      cell.rot = cell.fixed ? 0 : Math.floor(Math.random() * 4);
    }
    if (!powered(cells, size).has(cells.length - 1)) break;
  }

  return cells;
}

/** Which cells carry power, walked outward from the application. */
function powered(cells, size) {
  const idx = (r, c) => r * size + c;
  const seen = new Set([0]);
  const queue = [0];
  while (queue.length) {
    const at = queue.shift();
    const r = Math.floor(at / size);
    const c = at % size;
    const mask = rotate(cells[at].mask, cells[at].rot);
    for (const d of DIRS) {
      if (!(mask & d.bit)) continue;
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      const n = idx(nr, nc);
      if (seen.has(n)) continue;
      // Both halves have to agree, which is what makes a rotation matter.
      if (!(rotate(cells[n].mask, cells[n].rot) & d.opp)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return seen;
}

/* Rendering ---------------------------------------------------------------- */

const board = document.getElementById('board');

/*
 * The two endpoints are the console's own glyphs, a cube for the application
 * and a stack for the database, drawn on a chip the cable plugs into. Phosphor
 * regular, on a 256 grid, scaled into this tile's 100.
 */
const GLYPH = {
  app: 'M223.68,66.15,135.68,18h0a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32h0l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z',
  db: 'M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z',
};

/** A chip at the centre of a tile, opaque so the cable ends at it. */
function chip(kind) {
  const size = 26;
  const offset = (100 - size) / 2;
  return (
    `<rect class="chip" x="27" y="27" width="46" height="46" rx="11"/>` +
    `<g class="glyph" transform="translate(${offset} ${offset}) scale(${size / 256})">` +
    `<path d="${GLYPH[kind]}"/></g>`
  );
}

function pipePath(mask) {
  const seg = { 1: 'M50 50 L50 2', 2: 'M50 50 L98 50', 4: 'M50 50 L50 98', 8: 'M50 50 L2 50' };
  return Object.keys(seg).filter((b) => mask & b).map((b) => seg[b]).join(' ');
}

function render() {
  const size = state.size;
  const live = powered(state.cells, size);
  board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  board.style.width = `min(${size * 4.5}rem, 100%)`;
  board.replaceChildren();

  state.cells.forEach((cell, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'cell';
    if (cell.fixed) el.classList.add('fixed');
    if (live.has(i)) el.classList.add('powered');

    const kind = i === 0 ? 'app' : i === state.cells.length - 1 ? 'db' : '';
    el.setAttribute(
      'aria-label',
      kind === 'app' ? 'the application' : kind === 'db' ? 'the database' : `tile ${i + 1}, rotate`,
    );

    el.innerHTML =
      `<svg viewBox="0 0 100 100" aria-hidden="true">` +
      `<g class="rot" style="transform:rotate(${cell.rot * 90}deg)">` +
      `<path class="pipe" d="${pipePath(cell.mask)}"/></g>` +
      (kind ? chip(kind) : '') +
      `</svg>`;

    if (!cell.fixed) el.addEventListener('click', () => turn(i));
    board.append(el);
  });
}

function turn(i) {
  if (state.solved) return;
  state.cells[i].rot = (state.cells[i].rot + 1) % 4;
  state.moves++;
  if (!state.startedAt) {
    state.startedAt = performance.now();
    state.timer = setInterval(tick, 100);
  }
  document.getElementById('c-moves').textContent = state.moves;
  render();
  if (powered(state.cells, state.size).has(state.cells.length - 1)) win();
}

function tick() {
  const s = (performance.now() - state.startedAt) / 1000;
  document.getElementById('c-time').textContent = s.toFixed(1);
}

function elapsed() {
  return state.startedAt ? (performance.now() - state.startedAt) / 1000 : 0;
}

async function win() {
  state.solved = true;
  clearInterval(state.timer);
  const seconds = Number(elapsed().toFixed(2));

  const won = document.getElementById('won');
  won.hidden = false;
  won.textContent = `Connected in ${state.moves} moves and ${seconds.toFixed(1)} seconds. Writing the run to PostgreSQL…`;

  let stored = false;
  try {
    const res = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: state.level, moves: state.moves, seconds }),
    });
    if (res.ok) {
      stored = paint(await res.json());
    }
  } catch (err) {
    console.error(err);
  }

  won.textContent = stored
    ? `Stored. ${state.moves} moves, ${seconds.toFixed(1)} seconds. That row is in your database, not in this container, so it will still be here after you redeploy.`
    : `Solved in ${state.moves} moves. It was not stored, because no database is attached yet.`;

  setTimeout(() => {
    state.level++;
    state.size = Math.min(4 + Math.floor(state.level / 2), 8);
    start();
  }, 2600);
}

function start() {
  state.cells = generate(state.size);
  state.moves = 0;
  state.startedAt = null;
  state.solved = false;
  clearInterval(state.timer);
  document.getElementById('c-level').textContent = state.level;
  document.getElementById('c-moves').textContent = '0';
  document.getElementById('c-time').textContent = '0.0';
  document.getElementById('won').hidden = true;
  render();
}

/* The page around it ------------------------------------------------------- */

function fact(term, value, live) {
  const dot = live === undefined ? '' : `<span class="dot${live ? ' on' : ''}"></span>`;
  return `<div class="fact"><dt>${term}</dt><dd>${dot}${value}</dd></div>`;
}

function paint(s) {
  document.getElementById('facts').innerHTML = [
    fact('Application', s.app || 'unknown'),
    fact('Team', s.team || 'unknown'),
    fact('Database', s.dbConnected ? 'PostgreSQL, connected' : 'none attached', s.dbConnected),
    fact('Runs stored', s.dbConnected ? String(s.totalRuns) : '0'),
  ].join('');

  const rows = document.getElementById('rows');
  if (!s.dbConnected) {
    rows.innerHTML = `<p class="empty">${s.dbMessage || 'No database attached.'}</p>`;
    return false;
  }
  if (!s.recent.length) {
    rows.innerHTML = `<p class="empty">The <code>runs</code> table exists and is empty. Finish a level and it will not be.</p>`;
    return true;
  }

  const best = [
    s.bestMoves !== null ? `fewest moves ${s.bestMoves}` : null,
    s.bestSeconds !== null ? `fastest ${s.bestSeconds.toFixed(1)}s` : null,
  ].filter(Boolean).join(', ');

  rows.innerHTML =
    `<table><thead><tr><th>id</th><th>level</th><th>moves</th><th>seconds</th><th>completed_at</th></tr></thead><tbody>` +
    s.recent.map((r) =>
      `<tr><td>${r.id}</td><td>${r.level}</td><td>${r.moves}</td><td>${r.seconds.toFixed(2)}</td><td>${r.completedAt}</td></tr>`
    ).join('') +
    `</tbody></table>` +
    `<p class="empty" style="margin-top:0.9rem">` +
    `${s.totalRuns} row${s.totalRuns === 1 ? '' : 's'} in <code>runs</code>${best ? `, ${best}` : ''}. ` +
    `Redeploy this application and they will still be here.</p>`;
  return true;
}

fetch('/api/state').then((r) => r.json()).then(paint).catch(console.error);
start();
