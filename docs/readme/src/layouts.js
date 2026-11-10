// Glass scenes for Ethereal's README: the real app, captured by capture.mjs with the demo diary
// (Sara, who is made up), as frosted-glass windows floating in light. One spatial grammar for
// every scene, the same as the profile's: copy sits flush on the page colour, the windows float
// beside it, and the one detail that matters is lifted out of its window toward the viewer.
// Positions are the apparent centre in CSS px (y down), sizes are apparent CSS px, z is depth
// (+ toward the viewer; 1 unit = 1 px at z = 0). Crops are in capture pixels.

// Where the lifted details sit in each capture (written by capture.mjs).
const RECTS = await (async () => {
  try {
    if (typeof window !== 'undefined') return await (await fetch('/shots/rects.json')).json();
    const { readFileSync } = await import('node:fs');
    return JSON.parse(readFileSync(new URL('../.raw/shots/rects.json', import.meta.url), 'utf8'));
  } catch {
    return {};
  }
})();
/** A measured box in capture pixels, grown by `pad` CSS px on every side. */
const box = (shot, theme, key, dpr, pad = 0) => {
  const r = RECTS[`${shot}-${theme}`]?.[key];
  if (!r) throw new Error(`No box ${key} for ${shot}-${theme}: run capture.mjs`);
  return [r[0] - pad, r[1] - pad, r[2] + 2 * pad, r[3] + 2 * pad].map((v) => Math.round(v * dpr));
};
const D = 2,
  P = 3; // capture scale: desktop 1280 x 860 at 2x, phone 400 x 860 at 3x
const FULL_D = [0, 0, 2560, 1720],
  FULL_P = [0, 0, 1200, 2580];

const merge = (a, b) => {
  const o = { ...a };
  for (const k in b)
    o[k] =
      b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? merge(a[k] || {}, b[k]) : b[k];
  return o;
};

// ---------- light ----------
// Night: deep green-black with soft shafts of cool light falling through haze, and the app's
// own glow in the glass; edges melt into GitHub's dark page. Day: morning light through a tall
// window, dappled by leaves, on a white wall.
const NIGHT = merge(
  {
    page: '#0d1117',
    env: {
      top: '#0a0d15',
      bot: '#06080c',
      haze: '#18202f',
      hazeStr: 0.1,
      ray: '#a0b6dc',
      shafts: [
        [0.15, 0.06, 0.06, 0.16],
        [0.31, 0.024, 0.03, 0.1],
        [0.66, 0.03, -0.03, 0.11],
        [0.85, 0.07, -0.06, 0.15],
        [0.5, 0.2, 0.0, 0.05],
      ],
      glows: [
        [0.5, 1.15, 0.65, 0.1, '#8ea6d8'],
        [0.5, -0.15, 0.6, 0.05, '#4a5f86'],
      ],
    },
    glass: {
      tint: [0.062, 0.068, 0.082],
      transmit: 0.8,
      fog: '#0b0e15',
      light: [-700, 800, 900],
      rim: 0.9,
      spec: 0.4,
      glow: 0.62,
      shadow: 0.3,
      levels: 5,
      caustic: 0,
    },
    motes: { n: 70, color: '#d4e2ff', amt: 0.5 },
    bloom: 0.4,
    bloomThresh: 0.55,
    vig: 0.45,
  },
  {
    env: {
      top: '#08100e',
      bot: '#05070a',
      haze: '#16241f',
      ray: '#a8d8c4',
      shafts: [
        [0.47, 0.05, 0.05, 0.11],
        [0.62, 0.025, 0.02, 0.08],
        [0.84, 0.07, -0.04, 0.11],
        [0.68, 0.24, 0.0, 0.05],
        [0.28, 0.04, 0.04, 0.06],
      ],
      glows: [
        [0.66, 0.52, 0.42, 0.1, '#1f8a66'],
        [0.72, 1.1, 0.6, 0.08, '#8fb8d8'],
      ],
    },
    glass: { fog: '#08100e' },
    motes: { color: '#d4ffe8' },
  },
);
const DAY = merge(
  {
    page: '#ffffff',
    env: {
      top: '#eef1f5',
      bot: '#f6f6f4',
      haze: '#ffffff',
      hazeStr: 0.04,
      shadeCol: '#eceff4',
      sun: [-0.15, 0, -0.62, 0.95],
      dapple: 0.5,
      sunStr: 0.075,
      sunCol: '#fff4e2',
      shadow: 0.55,
      caustic: 0.1,
      shadowDir: [0.05, -0.075],
      glows: [],
    },
    glass: {
      tint: [0.075, 0.078, 0.084],
      transmit: 0.88,
      fog: '#eef1f5',
      light: [-700, 800, 900],
      rim: 0.95,
      spec: 0.3,
      glow: 0.0,
      shadow: 0.12,
      levels: 5,
      caustic: 0,
    },
    motes: { n: 40, color: '#fffaf0', amt: 0.45 },
    bloom: 0.0,
    bloomThresh: 0.95,
    vig: 0.4,
  },
  {
    env: {
      top: '#eef4f2',
      bot: '#f7f9f8',
      shadeCol: '#e9efed',
      sunCol: '#fff4e0',
      sun: [0.4, 0, -1.15, 1.05],
      dapple: 0.6,
    },
    glass: { fog: '#eef3f1' },
  },
);

// ---------- type ----------
const MINT = { night: '#5fdcaa', day: '#0f7d55' };
const C = {
  name: { night: { color: '#f5f7fb' }, day: { color: '#0b0d11' } },
  line: { night: { color: 'rgba(222,229,240,0.74)' }, day: { color: '#4a5161' } },
  copy: {
    night: { color: '#f5f7fb', '--muted': 'rgba(222,229,240,0.72)', '--kick': MINT.night },
    day: { color: '#0b0d11', '--muted': '#4a5161', '--kick': MINT.day },
  },
  fact: {
    night: { color: '#f3f5f9', '--muted': 'rgba(222,229,240,0.66)' },
    day: { color: '#10131a', '--muted': '#5a6170' },
  },
  vrule: {
    night: { background: 'rgba(200,225,215,0.16)' },
    day: { background: 'rgba(20,40,30,0.12)' },
  },
};
const T = (cls, html, x, y, style = {}, align) => ({
  cls,
  html,
  x,
  y,
  align,
  style,
  ...C[cls.split(' ')[0]],
});
const COPY = (o) => `<span class="k">${o.kick}</span><h2>${o.head}</h2><p>${o.text}</p>`;

// ---------- grammar ----------
const key = (n) => (n ? '#05080A' : '#FCFCFE'); // the app's own page colour, keyed out
const card = (n) => (n ? '#181B1F' : '#F2F5F7'); // the colour of its cards
const th = (n) => (n ? 'dark' : 'light');
const LIFT = (n) => ({
  bezel: 8,
  radius: 14,
  key: card(n),
  keyAmt: 0.9,
  shadowOff: n ? [0, -16, 40] : [10, -22, 26],
  shadow: n ? 0.45 : 0.22,
  glow: 0.25,
});

const PANEL = (o) => {
  const H = o.h || 430,
    R = o.side === 'right',
    pool = o.pool || [0.69, 0.5, 0.4, 0.7];
  return {
    css: [840, H],
    fade: [56, 56, 34, 44],
    cam: [12, 5],
    pool: R ? [1 - pool[0], pool[1], pool[2], pool[3]] : pool,
    night: merge(NIGHT, o.night || {}),
    day: merge(DAY, o.day || {}),
    windows: (n) => o.win(n, false),
    type: [
      T('copy', COPY(o), R ? 838 - (o.cw || 292) : 2, H / 2 + (o.ty || 0), {
        width: (o.cw || 292) + 'px',
        transform: 'translateY(-50%)',
      }),
    ],
  };
};
const PANEL_PHONE = (o) => ({
  css: [381, o.hp || 520],
  dpr: 1080 / 381,
  fade: [26, 26, 28, 36],
  cam: [8, 4],
  pool: o.poolPhone || [0.5, 0.66, 0.7, 0.4],
  night: merge(NIGHT, o.night || {}),
  day: merge(DAY, o.day || {}),
  windows: (n) => o.win(n, true),
  type: [T('copy phone', COPY(o), 4, 26, { width: '368px' })],
});

// The exercise demo in the workout player: one loop of the knee push-up, 48 frames 50 ms apart.
const FIG = 48;
const fig = (t) =>
  Array.from({ length: FIG }, (_, i) => `fig-${t}-${String(i).padStart(3, '0')}.png`);

// ---------- the hero ----------
// 7.2 s: three loops of the push-up while the glass drifts once around its orbit.
const HERO_S = 7.2;
const HERO = (ph) => ({
  css: ph ? [381, 640] : [840, 540],
  ...(ph ? { dpr: 1080 / 381 } : {}),
  fade: ph ? [28, 28, 30, 40] : [80, 80, 40, 70],
  cam: ph ? [7, 3] : [11, 4],
  motion: 0.75,
  pool: ph ? [0.5, 0.4, 0.75, 0.55] : [0.5, 0.42, 0.62, 0.62],
  seqAt: (phase, n) => Math.floor(((phase * HERO_S * 1000) % (n * 50)) / 50),
  night: merge(NIGHT, {
    env: {
      shafts: [
        [0.3, 0.05, 0.05, 0.14],
        [0.42, 0.02, 0.02, 0.11],
        [0.58, 0.022, -0.02, 0.12],
        [0.71, 0.05, -0.05, 0.14],
        [0.5, 0.22, 0.0, 0.07],
      ],
      glows: [
        [0.5, 0.4, 0.4, 0.14, '#1f8a66'],
        [0.5, 1.15, 0.65, 0.1, '#8fb8d8'],
        [0.5, -0.15, 0.6, 0.05, '#3a5f70'],
      ],
    },
  }),
  day: merge(DAY, { env: { sun: [0.1, 0, -0.8, 0.95] } }),
  windows: (n) => {
    const t = th(n);
    const P0 = ph
      ? [
          { x: 92, y: 236, w: 88, z: -820, rot: [10, 18, 0] },
          { x: 292, y: 234, w: 90, z: -820, rot: [10, -18, 0] },
          { x: 316, y: 318, w: 150, z: -320, rot: [2, -32, 0] },
          { x: 66, y: 318, w: 150, z: -320, rot: [2, 32, 0] },
          { x: 190, y: 390, w: 300, z: 40, rot: [3, 0, 0] },
          { x: 318, y: 474, h: 206, z: 170, rot: [0, -14, 0] },
          { x: 62, y: 488, h: 176, z: 130, rot: [0, 14, 0] },
        ]
      : [
          { x: 100, y: 176, w: 108, z: -820, rot: [10, 18, 0] },
          { x: 742, y: 174, w: 110, z: -820, rot: [10, -18, 0] },
          { x: 722, y: 292, w: 200, z: -320, rot: [2, -32, 0] },
          { x: 120, y: 294, w: 200, z: -320, rot: [2, 32, 0] },
          { x: 420, y: 332, w: 410, z: 40, rot: [3, 0, 0] },
          { x: 652, y: 392, h: 236, z: 170, rot: [0, -14, 0] },
          { x: 206, y: 410, h: 196, z: 150, rot: [0, 13, 0] },
        ];
    const W = [
      {
        tex: `d-review-${t}.png`,
        crop: FULL_D,
        key: key(n),
        keyAmt: 0.6,
        fog: n ? 0.62 : 0.4,
        lod: 1.2,
        defocus: 2.5,
        breathe: [16, 0.15],
        bezel: 8,
      },
      {
        tex: `d-eatout-${t}.png`,
        crop: FULL_D,
        key: key(n),
        keyAmt: 0.6,
        fog: n ? 0.58 : 0.38,
        lod: 1.2,
        defocus: 2.2,
        breathe: [12, 0.8],
        bezel: 8,
      },
      {
        tex: `d-train-${t}.png`,
        crop: FULL_D,
        key: key(n),
        keyAmt: 0.7,
        breathe: [12, 0.5],
        lod: 0.4,
        defocus: 0.8,
        fog: n ? 0.18 : 0.1,
      },
      {
        tex: `d-progress-${t}.png`,
        crop: FULL_D,
        key: key(n),
        keyAmt: 0.7,
        breathe: [12, 0.0],
        lod: 0.4,
        defocus: 0.8,
        fog: n ? 0.18 : 0.1,
      },
      {
        tex: `d-today-${t}.png`,
        crop: FULL_D,
        key: key(n),
        keyAmt: 0.7,
        breathe: [10, 0.6],
        bezel: 11,
        glow: 0.8,
      },
      { seq: fig(t), crop: FULL_P, key: key(n), keyAmt: 0.5, breathe: [9, 0.3], bezel: 8 },
      {
        tex: `m-diary-${t}.png`,
        crop: [0, 140, 1200, 2240],
        key: key(n),
        keyAmt: 0.55,
        breathe: [9, 0.7],
        bezel: 8,
      },
      {
        parent: 4,
        src: box('d-today', t, 'day', D, 10),
        lift: 120,
        breathe: [12, 0.85],
        ...LIFT(n),
      },
    ];
    return W.map((w, i) => ({ ...w, ...(P0[i] || {}) }));
  },
  type: ph
    ? [
        T('name', 'Ethereal', 190.5, 30, { fontSize: '54px' }, 'center'),
        T(
          'line',
          'A calm coach for your whole self:<br>your day, your training and your food.',
          190.5,
          100,
          { fontSize: '15.5px', textAlign: 'center' },
          'center',
        ),
      ]
    : [
        T('name', 'Ethereal', 420, 30, { fontSize: '66px' }, 'center'),
        T(
          'line',
          'A calm coach for your whole self: your day, your training and your food.',
          420,
          110,
          { fontSize: '17.5px' },
          'center',
        ),
      ],
});

// ---------- the numbers band ----------
const FACTS = [
  ['41', 'animated exercises for a small room'],
  ['1,474', 'foods, searchable offline'],
  ['155', 'dishes at 20 chains, ranked'],
  ['397', 'tests on every change'],
];
const BAND = (ph) => {
  const css = ph ? [381, 300] : [840, 196];
  const bw = ph ? 361 : 804,
    bh = ph ? 250 : 126,
    cx = css[0] / 2,
    cy = css[1] / 2;
  const cells = FACTS.map((f, i) =>
    ph
      ? {
          x: cx - bw / 2 + (i % 2) * (bw / 2) + 26,
          y: cy - bh / 2 + Math.floor(i / 2) * (bh / 2) + 26,
          w: bw / 2 - 44,
        }
      : { x: cx - bw / 2 + i * (bw / 4) + 28, y: cy - 34, w: bw / 4 - 48 },
  );
  return {
    css,
    ...(ph ? { dpr: 1080 / 381 } : {}),
    fade: ph ? [14, 14, 18, 18] : [30, 30, 22, 26],
    cam: [0, 0],
    motion: 0,
    vigOff: true,
    pool: [0.5, 0.5, 0.8, 0.95],
    night: merge(NIGHT, {
      env: {
        glows: [
          [0.5, 1.2, 0.7, 0.07, '#8fb8d8'],
          [0.5, -0.3, 0.6, 0.06, '#1f8a66'],
        ],
      },
      motes: { n: 24 },
    }),
    day: merge(DAY, { motes: { n: 16 } }),
    windows: () => [
      {
        x: cx,
        y: cy,
        w: bw,
        h: bh,
        z: 0,
        rot: [0, 0, 0],
        bar: false,
        bezel: 0,
        radius: 22,
        bevel: 14,
        breathe: [0, 0],
        glow: 0.35,
        glowColor: '#1d3a30',
        refract: 34,
      },
    ],
    type: [
      ...cells.map((c, i) =>
        T(
          'fact' + (ph ? ' phone' : ''),
          `<b>${FACTS[i][0]}</b><span>${FACTS[i][1]}</span>`,
          c.x,
          c.y,
          { width: c.w + 'px', whiteSpace: 'normal' },
        ),
      ),
      ...(ph
        ? [
            T('vrule', '', cx, cy - bh / 2 + 22, { height: bh - 44 + 'px' }),
            T('vrule', '', cx - bw / 2 + 22, cy, { width: bw - 44 + 'px', height: '1px' }),
          ]
        : [1, 2, 3].map((i) =>
            T('vrule', '', cx - bw / 2 + i * (bw / 4), cy - bh / 2 + 24, {
              height: bh - 48 + 'px',
            }),
          )),
    ],
  };
};

// ---------- the feature panels ----------
// Standard places: the desktop window behind, the phone in front of it, on the side away from
// the copy; a lifted detail floats nearest the viewer.
const SPOT = {
  left: {
    d: { x: 590, y: 204, w: 400, z: -80, rot: [2, -18, 0] },
    p: { x: 756, y: 250, h: 272, z: 60, rot: [0, -14, 0] },
  },
  right: {
    d: { x: 294, y: 212, w: 400, z: -80, rot: [2, 18, 0] },
    p: { x: 106, y: 254, h: 272, z: 60, rot: [0, 14, 0] },
  },
  phone: {
    d: { x: 200, y: 336, w: 318, z: -80, rot: [2, -14, 0] },
    p: { x: 316, y: 378, h: 236, z: 60, rot: [0, -14, 0] },
  },
};
const spot = (o, ph) => SPOT[ph ? 'phone' : o.side || 'left'];
const pick = (o, ph) => (ph ? o.phone || {} : o[o.side || 'left'] || {});

const TODAY = {
  kick: 'Today',
  head: 'Always know the next step',
  text: 'Your day, planned around your life, under a sky that follows the real time of day. What comes next is one tap away.',
  left: { shift: [-150, -100], grow: 1.05 },
  phone: { shift: [-60, -80], grow: 0.95 },
  win(n, ph) {
    const t = th(n),
      S = spot(this, ph),
      L = pick(this, ph);
    return [
      {
        tex: `d-today-${t}.png`,
        crop: FULL_D,
        ...S.d,
        key: key(n),
        keyAmt: 0.7,
        breathe: [8, 0.0],
        bezel: 10,
      },
      {
        tex: `m-today-${t}.png`,
        crop: FULL_P,
        ...S.p,
        key: key(n),
        keyAmt: 0.5,
        breathe: [8, 0.45],
        bezel: 8,
      },
      {
        parent: 0,
        src: box('d-today', t, 'now', D, 0),
        lift: 120,
        grow: L.grow,
        shift: L.shift,
        breathe: [10, 0.25],
        ...LIFT(n),
      },
    ];
  },
};

const TRAIN = {
  side: 'right',
  kick: 'Train',
  head: 'Train at home, starting small',
  text: 'A plan built from what you have: a towel, a chair or nothing. Each move climbs a ladder, from wall push-ups to the real thing.',
  win(n, ph) {
    const t = th(n);
    const S = ph
      ? {
          d: { x: 186, y: 330, w: 318, z: -80, rot: [2, -14, 0] },
          p: { x: 300, y: 384, h: 262, z: 60, rot: [0, -14, 0] },
        }
      : {
          d: { x: 320, y: 206, w: 410, z: -90, rot: [2, 18, 0] },
          p: { x: 124, y: 228, h: 330, z: 70, rot: [0, 14, 0] },
        };
    return [
      {
        tex: `d-train-${t}.png`,
        crop: FULL_D,
        ...S.d,
        key: key(n),
        keyAmt: 0.7,
        breathe: [8, 0.0],
        bezel: 10,
      },
      { seq: fig(t), crop: FULL_P, ...S.p, key: key(n), keyAmt: 0.5, breathe: [8, 0.45], bezel: 8 },
    ];
  },
};

const DIARY = {
  kick: 'Food diary',
  head: 'Log a day in seconds',
  text: 'Type what you ate in plain words, scan a barcode, or search 1,474 foods that work offline.',
  left: { shift: [-120, -40], grow: 1.25 },
  phone: { shift: [-110, -40], grow: 1.15 },
  win(n, ph) {
    const t = th(n),
      S = spot(this, ph),
      L = pick(this, ph);
    return [
      {
        tex: `d-search-${t}.png`,
        crop: FULL_D,
        ...S.d,
        key: key(n),
        keyAmt: 0.55,
        breathe: [8, 0.0],
        bezel: 10,
      },
      {
        tex: `m-diary-${t}.png`,
        crop: FULL_P,
        ...S.p,
        key: key(n),
        keyAmt: 0.55,
        breathe: [8, 0.45],
        bezel: 8,
      },
      {
        parent: 1,
        src: box('m-diary', t, 'ring', P, 0),
        lift: 110,
        grow: L.grow,
        shift: L.shift,
        breathe: [10, 0.25],
        ...LIFT(n),
      },
    ];
  },
};

const PROGRESS = {
  side: 'right',
  kick: 'Progress',
  head: 'A plan that learns from your results',
  text: 'Weigh-ins become a trend, your real burn is measured, and every two weeks it recommends one capped change.',
  right: { shift: [-150, -30], grow: 1.0 },
  phone: { shift: [-90, -40], grow: 0.9 },
  win(n, ph) {
    const t = th(n),
      S = spot(this, ph),
      L = pick(this, ph);
    return [
      {
        tex: `d-progress-${t}.png`,
        crop: FULL_D,
        ...S.d,
        key: key(n),
        keyAmt: 0.7,
        breathe: [8, 0.0],
        bezel: 10,
      },
      {
        tex: `m-review-${t}.png`,
        crop: FULL_P,
        ...S.p,
        key: key(n),
        keyAmt: 0.5,
        breathe: [8, 0.45],
        bezel: 8,
      },
      {
        parent: 0,
        src: box('d-progress', t, 'move', D, 0),
        lift: 120,
        grow: L.grow,
        shift: L.shift,
        breathe: [10, 0.25],
        ...LIFT(n),
      },
    ];
  },
};

const FOOD = {
  kick: 'Recipes and eating out',
  head: 'Food you will actually eat',
  text: '66 high-protein recipes built from the same food database as the diary, and the leanest order at 20 chains.',
  left: { shift: [-170, 44], grow: 1.85 },
  phone: { shift: [-150, 20], grow: 1.9 },
  win(n, ph) {
    const t = th(n),
      S = spot(this, ph),
      L = pick(this, ph);
    return [
      {
        tex: `d-eatout-${t}.png`,
        crop: FULL_D,
        ...S.d,
        key: key(n),
        keyAmt: 0.7,
        breathe: [8, 0.0],
        bezel: 10,
      },
      {
        tex: `m-recipe-${t}.png`,
        crop: FULL_P,
        ...S.p,
        key: key(n),
        keyAmt: 0.5,
        breathe: [8, 0.45],
        bezel: 8,
      },
      // the recipe's ingredients, each weighed against the same database as the diary
      {
        parent: 1,
        src: (([x, y, w]) => [x, y, w, 250 * P])(box('m-recipe', t, 'card', P, 6)),
        lift: 110,
        grow: L.grow,
        shift: L.shift,
        breathe: [10, 0.25],
        ...LIFT(n),
      },
    ];
  },
};

// ---------- the social preview, 1280 x 640 ----------
const SOCIAL = {
  css: [640, 320],
  fade: [26, 26, 22, 26],
  cam: [0, 0],
  motion: 0,
  pool: [0.7, 0.52, 0.4, 0.75],
  night: NIGHT,
  day: DAY,
  windows: (n) => {
    const t = th(n);
    return [
      {
        tex: `d-today-${t}.png`,
        crop: FULL_D,
        x: 446,
        y: 150,
        w: 300,
        z: -80,
        rot: [2, -18, 0],
        key: key(n),
        keyAmt: 0.7,
        breathe: [0, 0],
        bezel: 9,
      },
      {
        tex: `fig-${t}-020.png`,
        crop: FULL_P,
        x: 582,
        y: 186,
        h: 214,
        z: 60,
        rot: [0, -14, 0],
        key: key(n),
        keyAmt: 0.5,
        breathe: [0, 0],
        bezel: 7,
      },
      {
        parent: 0,
        src: box('d-today', t, 'day', D, 10),
        lift: 110,
        shift: [-40, -30],
        breathe: [0, 0],
        ...LIFT(n),
      },
    ];
  },
  type: [
    T('name', 'Ethereal', 38, 112, { fontSize: '52px' }),
    T('line', 'A calm coach for your whole self: your day, your training and your food.', 40, 180, {
      fontSize: '16.5px',
      whiteSpace: 'normal',
      width: '236px',
    }),
  ],
};

const still = { envStill: true, motion: 0, cam: [0, 0] };
export const LAYOUTS = {
  hero: HERO(false),
  'hero-phone': HERO(true),
  numbers: BAND(false),
  'numbers-phone': BAND(true),
  today: PANEL(TODAY),
  'today-phone': PANEL_PHONE(TODAY),
  train: { ...PANEL(TRAIN), ...still },
  'train-phone': { ...PANEL_PHONE(TRAIN), ...still },
  diary: PANEL(DIARY),
  'diary-phone': PANEL_PHONE(DIARY),
  progress: PANEL(PROGRESS),
  'progress-phone': PANEL_PHONE(PROGRESS),
  food: PANEL(FOOD),
  'food-phone': PANEL_PHONE(FOOD),
  social: SOCIAL,
};
for (const k in LAYOUTS) LAYOUTS[k].dpr = LAYOUTS[k].dpr || 2;
