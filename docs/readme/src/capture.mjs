/**
 * Fresh captures of the real app for the README's Glass scenes, in the dark theme and the light one.
 * Everything comes from the demo diary below (Sara, who is made up), on the live site by default.
 *
 *   node docs/readme/src/capture.mjs                     # every screen, both themes
 *   ORIGIN=http://localhost:4173 node docs/readme/src/capture.mjs   # against a local build
 *
 * Desktop screens are 1280 x 860 at 2x; phone screens are 400 x 860 at 3x. The clock is frozen at
 * 6:05 in the evening, so the Now card always shows the same moment of the same day. The workout
 * frames are the real exercise demo, stepped through one loop on a paused clock.
 */
import { chromium, devices } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../..');
const ORIGIN = (process.env.ORIGIN ?? 'https://gallowforge.github.io/Ethereal').replace(/\/$/, '');
const OUT = resolve(HERE, '../.raw/shots');
const ONLY = process.argv[2];
mkdirSync(OUT, { recursive: true });

/** Demo data: six weeks of weigh-ins and meals; today is mid-day with dinner still to log. Each
 *  day is the same breakfast, lunch and snack with a dinner from a weekly rotation, all weighed
 *  against the real food database so every number matches what the app would compute. */
const DEMO_DAYS = 42;
const foodDb = new Map(
  'abcdef'
    .split('')
    .flatMap((chunk) =>
      JSON.parse(readFileSync(resolve(REPO, `src/data/foods-${chunk}.json`), 'utf8')),
    )
    .map((f) => [f.id, f]),
);
const demoMeals = {
  daily: [
    ['breakfast', 'yogurt-greek-0', 250],
    ['breakfast', 'blueberries', 80],
    ['lunch', 'chicken-breast-cooked', 180],
    ['lunch', 'rice-basmati-cooked', 120],
    ['snack', 'almonds', 25],
  ],
  dinners: [
    [
      ['salmon-farmed-cooked', 125],
      ['sweet-potato-baked', 150],
    ],
    [['chicken-stir-fry', 400]],
    [
      ['lentil-soup-homemade', 350],
      ['salad-greek', 150],
    ],
    [['big-mac-mcdonalds', 219]],
    [['lamb-kofta-grilled', 180]],
    [['chicken-tikka-masala', 300]],
  ],
};
const demoFoods = Object.fromEntries(
  [...demoMeals.daily.map((m) => m[1]), ...demoMeals.dinners.flat().map((d) => d[0])].map((id) => {
    const f = foodDb.get(id);
    if (!f) throw new Error(`Demo food ${id} is not in the database`);
    return [id, { name: f.name, per100g: f.per100g }];
  }),
);

const seed = ({ days, meals, foods }) => {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const daysAgo = (n) => new Date(today.getTime() - n * 864e5);
  const time = { breakfast: 480, lunch: 760, snack: 960, dinner: 1170 };
  const food = [];
  const weights = [];
  const weightOn = (i) => +(82 - (days - 1 - i) * 0.075 + Math.sin(i) * 0.35).toFixed(1);
  for (let i = 0; i < days; i++) {
    const date = iso(daysAgo(i));
    weights.push({ date, weightKg: weightOn(i) });
    const dinner =
      i === 0 ? [] : meals.dinners[i % meals.dinners.length].map((d) => ['dinner', ...d]);
    for (const [meal, foodId, grams] of [...meals.daily, ...dinner]) {
      food.push({
        id: `${date}-${meal}-${foodId}`,
        date,
        meal,
        name: foods[foodId].name,
        foodId,
        grams,
        per100g: foods[foodId].per100g,
        source: 'local',
        time: time[meal],
      });
    }
  }
  localStorage.setItem('ethereal:tour:v1', '1');
  localStorage.setItem(
    'ethereal:profile:v1',
    JSON.stringify({
      units: 'metric',
      sex: 'female',
      age: 35,
      heightCm: 168,
      weightKg: weightOn(0),
      activity: 1.375,
      bodyFatPct: null,
    }),
  );
  localStorage.setItem(
    'ethereal:plan:v1',
    JSON.stringify({
      active: true,
      goal: 'lose',
      goalWeightKg: 68,
      rateKgPerWeek: 0.5,
      formula: 'mifflin',
      macroPreset: 'high-protein',
      startedOn: iso(daysAgo(days - 1)),
      startWeightKg: 82,
      calorieOverride: null,
      lastAdjustedOn: null,
    }),
  );
  localStorage.setItem('ethereal:log:v1', JSON.stringify({ entries: weights.reverse() }));
  localStorage.setItem(
    'ethereal:life:v1',
    JSON.stringify({
      name: 'Sara',
      goals: ['lose-fat', 'get-stronger', 'sleep-better'],
      why: 'Keep up with my kids and feel strong again.',
      wake: '06:45',
      sleep: '23:00',
      meals: { breakfast: '07:30', lunch: '12:40', dinner: '19:30' },
      busy: [{ id: 'w', label: 'Work', start: '08:30', end: '16:30', days: [0, 1, 2, 3, 4, 5, 6] }],
      meds: [{ id: 'd', name: 'Vitamin D', dose: '1000 IU', rule: 'with-food', times: [] }],
      ready: true,
    }),
  );
  // Training: three weeks in, every day a training day so today always has a session.
  const session = (n) => ({
    id: `w${n}`,
    date: iso(daysAgo(n * 2 + 1)),
    session: n % 2 ? 'A' : 'B',
    week: 3 - Math.floor(n / 3),
    minutes: 27,
    kcal: 160,
    feel: 2,
    sets: [
      { exerciseId: 'knee-push-up', value: 12 },
      { exerciseId: 'knee-push-up', value: 11 },
      { exerciseId: 'squat', value: 14 },
      { exerciseId: 'squat', value: 13 },
    ],
  });
  localStorage.setItem(
    'ethereal:train:v1',
    JSON.stringify({
      setup: {
        equipment: ['towel', 'chair', 'bed'],
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        minutes: 30,
        level: 2,
        easyOnLegs: false,
        startedOn: iso(daysAgo(17)),
        rungs: { push: 'knee-push-up', squat: 'squat', pull: 'towel-row', plank: 'plank' },
      },
      log: [5, 4, 3, 2, 1, 0].map(session),
      voice: false,
      sound: true,
      current: null,
    }),
  );
  localStorage.setItem(
    'ethereal:day:v1',
    JSON.stringify({ ticks: { [iso(today)]: ['wake', 'med-d-07:30'] } }),
  );
  localStorage.setItem(
    'ethereal:diary:v1',
    JSON.stringify({
      food,
      exercise: [{ id: 'x1', date: iso(today), activity: 'walking-brisk', minutes: 30, kcal: 150 }],
      water: { [iso(today)]: 4 },
      customFoods: [],
      recent: [],
      favourites: [],
      meals: [],
      steps: Object.fromEntries(
        [8200, 9400, 7100, 10300, 8800, 6900, 9600].map((n, i) => [iso(daysAgo(i)), n]),
      ),
      products: {},
    }),
  );
};
const demo = { days: DEMO_DAYS, meals: demoMeals, foods: demoFoods };

const DESK = { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 };
const PHONE = {
  ...devices['Pixel 7'],
  viewport: { width: 400, height: 860 },
  deviceScaleFactor: 3,
};

const scrollTo = (y) => (p) =>
  p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
const scrollToSelector = (selector, offset) => (p) =>
  p.evaluate(
    ([s, o]) => {
      const t = document.querySelector(s).getBoundingClientRect().top;
      window.scrollTo({ top: t + scrollY - o, behavior: 'instant' });
    },
    [selector, offset],
  );
const scrollToHeading = (text, offset) => (p) =>
  p.evaluate(
    ([text, o]) => {
      const h = [...document.querySelectorAll('h2')].find((x) => x.textContent.includes(text));
      window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - o, behavior: 'instant' });
    },
    [text, offset],
  );
// Search runs offline, so the dialog shows the built-in foods without waiting on Open Food Facts.
const searchFor = (query) => async (p) => {
  await p.context().setOffline(true);
  await p.getByRole('button', { name: /^Add$/ }).first().click();
  await p.waitForTimeout(500);
  await p.locator('input[type="search"], input[type="text"]').first().fill(query);
  await p.mouse.move(0, 0);
  await p.waitForTimeout(900);
};
// Into a workout: start it, skip the warm-up, and stop on the first working set.
const intoWorkout = async (p) => {
  await p.getByRole('button', { name: /start workout|train anyway/i }).click();
  await p.getByRole('button', { name: /^start$/i }).click();
  for (let i = 0; i < 2; i++) {
    await p.waitForTimeout(300);
    await p
      .getByRole('dialog', { name: 'Workout' })
      .getByRole('button', { name: /skip|done/i })
      .last()
      .click();
  }
  await p.waitForTimeout(1200);
};

/** Where the parts that the scenes lift out sit in each capture, in CSS px of the viewport.
 *  A box is a CSS selector, `text:<words>` (the element showing them) optionally followed by
 *  ` @ <selector>` (its nearest ancestor matching it), or `value=<text>` for an input. */
const measure = (p, boxes) =>
  p.evaluate((boxes) => {
    const out = {};
    for (const [k, spec] of Object.entries(boxes)) {
      let el = null;
      if (spec.startsWith('text:')) {
        const [t, up] = spec.slice(5).split(' @ ');
        const leaf = [...document.querySelectorAll('body *')].find(
          (e) => e.children.length === 0 && e.textContent.includes(t) && e.getClientRects().length,
        );
        el = up ? (leaf?.closest(up) ?? null) : (leaf ?? null);
      } else if (spec.startsWith('value=')) {
        el = [...document.querySelectorAll('input')].find((i) => i.value === spec.slice(6)) ?? null;
      } else el = document.querySelector(spec);
      const r = el?.getBoundingClientRect();
      out[k] = r ? [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10) : null;
    }
    return out;
  }, boxes);

// [name, device, path, action, boxes]
const SHOTS = [
  [
    'd-today',
    DESK,
    '/today/',
    null,
    { hero: '.today-hero', now: '[aria-label="What\'s next"]', day: '[aria-label^="Your day"]' },
  ],
  ['d-train', DESK, '/train/', null, { session: 'text:Session A is ready @ .surface' }],
  [
    'd-progress',
    DESK,
    '/progress/',
    null,
    { move: 'text:Your next move @ .surface', head: 'text:kg to go' },
  ],
  ['d-review', DESK, '/review/', null, { decision: "text:Next week's decision @ .surface" }],
  [
    'd-eatout',
    DESK,
    '/eating-out/',
    scrollToHeading("Nando's", 90),
    { row: 'text:Chicken Butterfly @ tr', table: 'text:Chicken Butterfly @ table' },
  ],
  ['d-search', DESK, '/today/', searchFor('chicken breast'), { dialog: '[role="dialog"]' }],
  ['d-recipes', DESK, '/recipes/'],
  ['m-today', PHONE, '/today/', null, { now: '[aria-label="What\'s next"]' }],
  [
    'm-diary',
    PHONE,
    '/today/',
    scrollToSelector('[aria-label="Calories and macros"]', 150),
    { ring: '[aria-label="Calories and macros"]' },
  ],
  ['m-player', PHONE, '/train/', intoWorkout],
  ['m-library', PHONE, '/train/exercises/', scrollTo(260)],
  ['m-progress', PHONE, '/progress/'],
  ['m-track', PHONE, '/track/', scrollTo(640)],
  ['m-review', PHONE, '/review/'],
  [
    'm-recipe',
    PHONE,
    '/recipes/shakshuka-with-feta/',
    null,
    {
      ingredients: 'text:Ingredients @ section',
      card: 'text:Ingredients @ .surface',
      title: 'main h1',
    },
  ],
  ['m-planner', PHONE, '/eat/', scrollToSelector('#dayplan-h', 120)],
  ['m-search', PHONE, '/today/', searchFor('chicken')],
];
const rects = {};

const browser = await chromium.launch();
const open = async (device, path, theme, { install = false } = {}) => {
  const ctx = await browser.newContext({ ...device, colorScheme: theme });
  const evening = new Date();
  evening.setHours(18, 5, 0, 0);
  if (install) await ctx.clock.install({ time: evening });
  else await ctx.clock.setFixedTime(evening);
  await ctx.addInitScript(seed, demo);
  await ctx.addInitScript((t) => localStorage.setItem('ethereal:theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return { ctx, page };
};
for (const theme of ['dark', 'light']) {
  for (const [name, device, path, action, boxes] of SHOTS) {
    if (ONLY && !name.startsWith(ONLY)) continue;
    const { ctx, page } = await open(device, path, theme);
    try {
      if (action) await action(page);
      await page.waitForTimeout(900);
      if (boxes) rects[`${name}-${theme}`] = await measure(page, boxes);
      await page.screenshot({ path: `${OUT}/${name}-${theme}.png` });
      console.log('shot', name, theme);
    } catch (e) {
      console.log('FAIL', name, theme, e.message.split('\n')[0]);
    }
    await ctx.close();
  }
  // The exercise demo in the workout player, frame by frame over one loop of the move.
  if (!ONLY || ONLY === 'fig') {
    const { ctx, page } = await open(PHONE, '/train/', theme, { install: true });
    await intoWorkout(page);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 400);
    // One loop of the knee push-up demo is 2.4 s: 48 frames, 50 ms apart.
    const N = Number(process.env.FIG_FRAMES ?? 48);
    const STEP = Number(process.env.FIG_STEP ?? 50);
    for (let i = 0; i < N; i++) {
      await page.clock.runFor(STEP);
      await page.waitForTimeout(60);
      await page.screenshot({ path: `${OUT}/fig-${theme}-${String(i).padStart(3, '0')}.png` });
    }
    writeFileSync(`${OUT}/fig.json`, JSON.stringify({ frames: N, stepMs: STEP }));
    console.log('figure frames', theme, N);
    await ctx.close();
  }
}
await browser.close();
// Merged, so capturing one screen again keeps the others' boxes.
const known = existsSync(`${OUT}/rects.json`)
  ? JSON.parse(readFileSync(`${OUT}/rects.json`, 'utf8'))
  : {};
writeFileSync(`${OUT}/rects.json`, JSON.stringify({ ...known, ...rects }, null, 1));
