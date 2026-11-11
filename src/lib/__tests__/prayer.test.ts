import { describe, expect, it } from 'vitest';
import { METHODS, prayerTimes, suggestMethod, type PrayerMethod } from '../prayer';

/** Minutes after local midnight, in a zone a fixed number of hours from UTC. */
const localMinutes = (d: Date, offsetH: number) => (d.getTime() / 60000 + offsetH * 60) % 1440;
const mins = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 60000;

describe('prayer times', () => {
  it('puts solar noon at Greenwich where the equation of time says', () => {
    // Early November the sun runs about 16.4 minutes fast: noon near 11:43:35 UTC.
    const t = prayerTimes('2026-11-01', 51.4769, 0, { method: 'mwl' });
    const utc = t.dhuhr.getUTCHours() * 60 + t.dhuhr.getUTCMinutes() + t.dhuhr.getUTCSeconds() / 60;
    expect(Math.abs(utc - (11 * 60 + 43.6))).toBeLessThan(1);
  });

  it('agrees with an independent calculation for Osaka', () => {
    // 1 November, at UTC+9 all year. Worked from the Meeus series (Astronomical Algorithms,
    // ch. 25 and 28), not from this engine's own formulas. The equation of time is 16.46 min, so
    // noon = 12:00 − (135.5023° × 4 min − 540 min) − 16.46 min = 11:41.53. At sunrise the
    // declination is −14.33°; at 34.69° N the sun is 0.833° below the horizon at an hour angle
    // of 80.88°, which is 5 h 23.51 min before noon: 06:18.02.
    const t = prayerTimes('2026-11-01', 34.6937, 135.5023, { method: 'mwl' });
    expect(Math.abs(localMinutes(t.dhuhr, 9) - (11 * 60 + 41.53))).toBeLessThan(0.5);
    expect(Math.abs(localMinutes(t.sunrise, 9) - (6 * 60 + 18.02))).toBeLessThan(0.5);
  });

  it('keeps the order of the day and midday between sunrise and sunset', () => {
    for (const method of Object.keys(METHODS) as PrayerMethod[]) {
      const t = prayerTimes('2026-03-20', 21.3891, 39.8579, { method });
      const order = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha].map((d) => d.getTime());
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      const mid = (t.sunrise.getTime() + t.maghrib.getTime()) / 2;
      expect(Math.abs(mid - t.dhuhr.getTime()) / 60000).toBeLessThan(3);
    }
  });

  it('sets Isha by minutes for Umm al-Qura, with 30 more in Ramadan', () => {
    const t = prayerTimes('2026-11-01', 21.3891, 39.8579, { method: 'makkah' });
    expect(Math.round(mins(t.maghrib, t.isha))).toBe(90);
    const r = prayerTimes('2026-11-01', 21.3891, 39.8579, { method: 'makkah', ramadan: true });
    expect(Math.round(mins(r.maghrib, r.isha))).toBe(120);
  });

  it('makes Hanafi Asr later than standard', () => {
    const s = prayerTimes('2026-11-01', 24.86, 67.0, { method: 'karachi' });
    const h = prayerTimes('2026-11-01', 24.86, 67.0, { method: 'karachi', asr: 'hanafi' });
    expect(mins(s.asr, h.asr)).toBeGreaterThan(30);
  });

  it('still gives Fajr and Isha in a northern midsummer', () => {
    const t = prayerTimes('2026-06-21', 59.3293, 18.0686, { method: 'mwl' });
    for (const d of Object.values(t)) expect(Number.isFinite(d.getTime())).toBe(true);
    expect(t.fajr.getTime()).toBeLessThan(t.sunrise.getTime());
    expect(t.isha.getTime()).toBeGreaterThan(t.maghrib.getTime());
  });

  it('suggests the method of the region a place is in', () => {
    // One place per method the suggestion can return, in the order of the method list. The
    // Qatar row sits where two regions overlap, so it also pins down which one is asked first.
    const places: Array<[PrayerMethod, number, number]> = [
      ['mwl', 51.5, -0.1],
      ['mwl', 34.7, 135.5],
      ['isna', 43.7, -79.4],
      ['egypt', 30.0, 31.2],
      ['makkah', 21.4, 39.9],
      ['karachi', 24.9, 67.0],
      ['kuwait', 29.5, 47.5],
      ['qatar', 25.3, 51.6],
      ['dubai', 25.2, 55.3],
      ['turkey', 41.0, 29.0],
      ['singapore', 1.4, 103.8],
    ];
    for (const [method, lat, lon] of places) expect(suggestMethod(lat, lon)).toBe(method);
  });
});
