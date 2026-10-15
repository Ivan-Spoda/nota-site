// Interactive mock of the Nota main window shown in the hero. Laid out at a
// fixed 1680 px width; the Hero scales it to fit. Colors are the app's
// Ember Graphite palette, independent of the site theme.
import { Fragment, useEffect, useState } from "react";
import { Transport } from "./hero/Transport";

const PANEL = import.meta.env.BASE_URL + "hero/devices-panel.webp";

const BARS = 17, BAR_PX = 70;
const ICON = {
  keys: "M3.5 6 h17 v12 h-17 z M9.2 6 v12 M14.8 6 v12 M6.3 6 v5 M12 6 v5 M17.7 6 v5",
  fader: "M7 4.5 v15 M12 4.5 v15 M17 4.5 v15 M5 9 h4 M10 14.5 h4 M15 7.5 h4",
  midi: "M6 17.2 a2.6 2.4 0 1 0 5.2 0 a2.6 2.4 0 1 0 -5.2 0 M11.2 17.2 V5 c3 .9 5.6 2.4 5.6 5.6",
  folder: "M3.5 7.5 h5.6 l2.1 2.6 h9.3 v9.4 h-17 z",
  bookmark: "M6.5 4 h11 v16 l-5.5 -4.4 l-5.5 4.4 z",
  doc: "M6 3.5 h7.6 l4.8 4.8 v12.2 h-12.4 z M13.6 3.5 v4.8 h4.8 M9.2 13.4 h6 M9.2 16.8 h6",
  map: "M3.4 17.6 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M15.4 6.4 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M7.9 15.7 L16.1 8.3",
};
const RAIL = [["Instr", ICON.keys], ["FX", ICON.fader], ["MIDI", ICON.midi], ["Files", ICON.folder], ["Preset", ICON.bookmark], ["Proj", ICON.doc], ["Map", ICON.map]];
const BROWSER: [string, string, { fav?: number; dot?: string }?][] = [
  ["Operator", "FM synth", { fav: 1 }], ["Volt", "analog synth", { fav: 1, dot: "#6A9FD8" }],
  ["Aurora", "wavetable synth"], ["Bass", "bass synth", { dot: "#F06A6E" }], ["Consort", "paraphonic synth"],
  ["Drum Rack", "pads"], ["Flux", "vector-morph synth"], ["Grain", "granular synth"],
  ["Instrument Rack", "parallel chains"], ["Monolith", "mono synth"], ["Pendulum", "arp synth"],
  ["Pentad", "poly synth"], ["Physical", "physical synth"], ["Rhythm", "drum machine"],
  ["Sampler", "sample playback"], ["Synth", "subtractive synth"],
];
const PLUGINS = [["Diva", "u-he · VST3"], ["Pigments", "Arturia · AU"], ["Serum 2", "Xfer · VST3"]];

type Track = {
  name?: string; group?: string; master?: number; kind?: string; color: string; input?: string; gain?: string;
  fader?: number; meter?: number; wave?: "midi" | "hits"; inGroup?: number; decay?: number; dense?: number; clips?: number[][];
};
const C = { inst: "#6A9FD8", vox: "#B3B45E", drums: "#6CC673", perc: "#5FB3A8", aux: "#E0A84A" };
const TRACKS: Track[] = [
  { name: "Nota Volt", kind: "MIDI", color: C.perc, input: "In · None", gain: "0.0", fader: 62, meter: 58, wave: "midi", clips: [[10, 8]] },
  { group: "VOCAL", color: C.vox },
  { name: "Audio 3", kind: "AUDIO", color: C.vox, input: "Ext In", gain: "0.0", fader: 62, meter: 64, inGroup: 1, clips: [[2, 8], [10, 1]] },
  { name: "Audio 4", kind: "AUDIO", color: C.vox, input: "Ext In", gain: "0.0", fader: 62, meter: 40, inGroup: 1, decay: 1, clips: [[10, 2], [14, 2]] },
  { group: "Drums", color: C.drums },
  { name: "Nota Drum Rack", kind: "MIDI", color: C.drums, input: "In · None", gain: "0.0", fader: 62, meter: 70, inGroup: 1, wave: "hits", clips: [[10, 4], [14, 4]] },
  { name: "Audio 7", kind: "AUDIO", color: C.perc, input: "Ext In", gain: "0.0", fader: 62, meter: 76, inGroup: 1, dense: 1, clips: [[2, 8], [10, 8]] },
  { name: "Audio 8", kind: "AUDIO", color: C.aux, input: "Ext In", gain: "0.0", fader: 62, meter: 22, clips: [[1.5, 1], [9, 9]] },
  { master: 1, name: "Master", color: "#FF9F1C" },
];

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wavePath(w: number, seed: number, t: Track) {
  const r = rng(seed * 2654435761 + 17), step = t.dense ? 2 : 3, h = 100;
  let d = "";
  for (let x = 2; x < w - 1; x += step) {
    let a;
    if (t.decay) { const ph = (x % (w / 1.2)) / (w / 1.2); a = Math.exp(-ph * 9) * (0.6 + r() * 0.4) * 40 + r() * 2; }
    else if (t.dense) { const beat = (x % 17.5) / 17.5; a = (Math.exp(-beat * 5) * 0.85 + r() * 0.15) * 42; }
    else { const env = Math.min(1, Math.min(x, w - x) / 18); a = (0.12 + r() * 0.55 + 0.25 * Math.sin(x / 23)) * env * 38; }
    a = Math.max(0.8, Math.abs(a));
    d += "M" + x.toFixed(1) + " " + (h / 2 - a + 6).toFixed(1) + " V" + (h / 2 + a + 6).toFixed(1) + " ";
  }
  return d;
}
function midiPath(w: number, seed: number) {
  const r = rng(seed * 40503 + 7), rows = 8, rh = 80 / rows;
  let d = "";
  for (let x = 4; x < w - 10; x += 9) {
    if (r() > 0.6) continue;
    const y = 16 + Math.floor(r() * rows) * rh, len = 8 + Math.floor(r() * 3) * 9;
    d += "M" + x + " " + y.toFixed(1) + " h" + Math.min(len, w - x - 4) + " ";
  }
  return d;
}
function hitsPath(w: number) {
  let d = "";
  const rows = [[78, 1], [62, 0.5], [46, 0.25]];
  rows.forEach(([y, every], i) => {
    for (let x = 4; x < w - 4; x += BAR_PX / 4 * every * (i === 0 ? 4 : 1)) d += "M" + x.toFixed(1) + " " + y + " h4 ";
  });
  return d;
}
// Static parts, computed once.
const rail = RAIL.map(([label, icon], i) => ({ label, icon, ink: i === 0 ? "#FF9F1C" : "#A4A9B0", bar: i === 0 ? "#FF9F1C" : "transparent", rule: i === 3 ? "#141517" : "transparent" }));
const rows: Record<string, any>[] = [
  { isGroup: true, isItem: false, label: "BUILT-IN", count: 16 },
  ...BROWSER.map(([name, sub, m]) => {
    const on = name === "Volt";
    return { isGroup: false, isItem: true, prefix: "Nota", name, sub, fav: !!m?.fav, dot: m?.dot || null,
      bg: on ? "#393C41" : "transparent", edge: on ? "#FF9F1C" : "transparent", nameInk: on ? "#F4F5F6" : "#E8E9EB" };
  }),
  { isGroup: true, isItem: false, label: "PLUG-INS", count: 23 },
  ...PLUGINS.map(([name, sub]) => ({ isGroup: false, isItem: true, prefix: "", name, sub, fav: false, dot: null, bg: "transparent", edge: "transparent", nameInk: "#D4D6DA" })),
];
const mini = (() => {
  const out: { left: string; width: string; top: string; color: string }[] = [];
  let row = 0;
  TRACKS.forEach((t) => {
    if (!t.clips) return;
    for (let rep = 0; rep < 6; rep++) {
      if ((rep + row) % 4 === 3) continue;
      t.clips.forEach(([bar, len]) => {
        const b = bar + rep * 16;
        if (b > 97) return;
        out.push({ left: ((b - 1) / 97 * 100) + "%", width: (len / 97 * 100) + "%", top: (5 + row * 3.4) + "px", color: t.color });
      });
    }
    row++;
  });
  return out;
})();
const sections = ([["Intro", 2, 8], ["Section 1", 10, 8]] as const).map(([name, b, len], i) => ({
  name, bars: b + "–" + (b + len - 1), left: ((b - 1) / BARS * 100) + "%", width: "calc(" + (len / BARS * 100) + "% - 2px)",
  edge: i ? "#82868C" : "#FF9F1C", bg: i ? "#232427" : "#393C41", ink: i ? "#C0C4C9" : "#FFB547",
}));
const ticks = Array.from({ length: BARS }, (_, i) => ({
  left: (i / BARS * 100) + "%", label: i + 1,
  line: i % 4 === 0 ? "#45484E" : "#45484E", ink: i % 4 === 0 ? "#C0C4C9" : "#82868C",
}));
export function MainWindow() {
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState("Arrangement");
  const [sel, setSel] = useState("Nota Volt");

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setT((v) => (v >= 18 ? 1 : v + 0.02)), 40);
    return () => clearInterval(iv);
  }, [playing]);

  const bar = Math.floor(t), beat = Math.floor((t - bar) * 4) + 1, tick = Math.floor((((t - bar) * 4) % 1) * 100);
  const pos = bar + "." + beat + "." + String(tick).padStart(2, "0");
  const onPlay = () => setPlaying(!playing);
  const onStop = () => { setPlaying(false); setT(1); };
  const headFrac = ((t - 1) / BARS).toFixed(4);

  const lanes: (Record<string, any> & { clips: any[] })[] = TRACKS.map((tr) => {
    if (tr.group) return {
      isGroup: true, isTrack: false, isMaster: false, name: tr.group, kind: "GROUP", color: tr.color,
      h: "26px", pad: "0 10px 0 12px", rule: "#141517", headBg: "#34363B", laneBg: "#222326", nameInk: "#E8E9EB", spineX: "0", clips: [],
    };
    if (tr.master) return {
      isGroup: false, isTrack: false, isMaster: true, name: "Master", kind: "0.0 dB", color: tr.color,
      h: "30px", pad: "0 10px 0 12px", rule: "#141517", headBg: "#2B2D31", laneBg: "#17181A", nameInk: "#E8E9EB", spineX: "0", clips: [],
    };
    const name = tr.name!, on = sel === name;
    let prevEnd = -1;
    const clips = tr.clips!.map(([b, len], i) => {
      const w = len * BAR_PX, runStart = Math.abs(b - prevEnd) > 0.01;
      prevEnd = b + len;
      const seed = Math.round(b * 7) + name.length * 13 + i;
      const path = tr.wave === "midi" ? midiPath(w, seed) : tr.wave === "hits" ? hitsPath(w) : wavePath(w, seed, tr);
      return {
        left: ((b - 1) / BARS * 100) + "%", width: "calc(" + (len / BARS * 100) + "% - 2px)",
        label: runStart ? name : null, labelInk: "#E8E9EB",
        viewBox: "0 0 " + w + " 100", path, sw: tr.wave ? 2 : 1,
        ink: tr.color, fill: tr.color + "24", stroke: on ? tr.color : tr.color + "70", band: tr.color,
      };
    });
    return {
      isGroup: false, isTrack: true, isMaster: false, name, kind: tr.kind, color: tr.color,
      h: "62px", pad: tr.inGroup ? "0 10px 0 22px" : "0 10px 0 12px", rule: "#34363B",
      headBg: on ? "#393C41" : "#2B2D31", laneBg: on ? "#222326" : "#1E1F22",
      nameInk: on ? "#F4F5F6" : "#E8E9EB", spineX: tr.inGroup ? "10px" : "0",
      input: tr.input, gain: tr.gain, fader: tr.fader + "%", meter: (playing ? tr.meter : 0) + "%",
      onSelect: () => setSel(name), clips,
    };
  });
  return (
    <div data-screen-label="Main window" style={{ width: '1680px', display: 'flex', flexDirection: 'column', background: '#141517', border: '1px solid #141517', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 30px 80px #000000B0' }}>
      <div style={{ height: '30px', flex: 'none', display: 'flex', alignItems: 'center', padding: '0 12px', background: '#1E1F22', borderBottom: '1px solid #45484E', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ position: 'absolute', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none', display: 'flex', justifyContent: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#D4D6DA' }}>Nota</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
        <Transport project="demo02" view={view} onView={setView} playing={playing} pos={pos} onPlay={onPlay} onStop={onStop} />
        <div style={{ height: '556px', flex: 'none', display: 'flex', gap: '12px' }}>
          <div style={{ width: '300px', flex: 'none', display: 'flex', background: '#2B2D31', border: '1px solid #141517', borderRadius: '6px', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ width: '40px', flex: 'none', display: 'flex', flexDirection: 'column', background: '#2B2D31', borderRight: '1px solid #45484E' }}>
              {rail.map((t, tI) => (
                <Fragment key={tI}>
                  <div title={t.label} style={{ height: '36px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', borderTop: `1px solid ${t.rule}` }}>
                    <div style={{ position: 'absolute', left: '0', top: '6px', bottom: '6px', width: '2px', borderRadius: '1px', background: t.bar }} />
                    <svg width="16" height="16" viewBox={'0 0 24 24'} fill="none" stroke={t.ink} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
                      <path d={t.icon} />
                    </svg>
                  </div>
                </Fragment>
              ))}
              <div style={{ flex: '1' }} />
              <div title="Hide browser" style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #45484E' }}>
                <svg width="15" height="15" viewBox={'0 0 24 24'} fill="none" stroke="#92969D" strokeWidth="1.5">
                  <path d="M4 5 h16 v14 h-16 z M9 5 v14" />
                </svg>
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', background: '#2B2D31', minHeight: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 8px 6px 8px' }}>
                <div style={{ flex: '1', minWidth: '0', height: '26px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', background: '#17181A', border: '1px solid #141517', borderRadius: '5px', boxSizing: 'border-box' }}>
                  <svg width="11" height="11" viewBox={'0 0 24 24'} fill="none" stroke="#92969D" strokeWidth="2">
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="M15.5 15.5 L21 21" />
                  </svg>
                  <span style={{ flex: '1', fontSize: '11px', color: '#82868C' }}>Search</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: '#92969D' }}>39</span>
                </div>
                <div style={{ width: '26px', height: '26px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#17181A', border: '1px solid #141517', borderRadius: '5px', boxSizing: 'border-box' }}>
                  <svg width="12" height="12" viewBox={'0 0 24 24'} fill="none" stroke="#A4A9B0" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M4 7 H20 M7 12 H17 M10 17 H14" />
                  </svg>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 8px 7px 8px' }}>
                <div style={{ height: '20px', display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: '10px', border: '1px solid #141517', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#C0C4C9' }}>Favorites</span>
                </div>
                <div style={{ height: '20px', display: 'flex', alignItems: 'center', gap: '5px', padding: '0 8px', borderRadius: '10px', border: '1px solid #141517', boxSizing: 'border-box' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F06A6E' }} />
                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#C0C4C9' }}>bass</span>
                </div>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '10px', color: '#92969D' }}>+2</span>
              </div>
              <div style={{ flex: '1', minHeight: '0', overflow: 'hidden' }}>
                {rows.map((r, rI) => (
                  <Fragment key={rI}>
                    {r.isGroup ? (
                      <>
                        <div style={{ height: '22px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', color: '#92969D' }}>{r.label}</span>
                          <span style={{ flex: '1', height: '1px', background: '#45484E' }} />
                          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: '#82868C' }}>{r.count}</span>
                        </div>
                      </>
                    ) : null}
                    {r.isItem ? (
                      <>
                        <div style={{ height: '26px', display: 'flex', alignItems: 'center', gap: '7px', padding: '0 10px 0 8px', position: 'relative', background: r.bg }}>
                          <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '2px', background: r.edge }} />
                          <svg width="7" height="7" viewBox={'0 0 10 10'} fill="#82868C" style={{ flex: 'none' }}>
                            <path d="M2 0 L7 5 L2 10 Z" />
                          </svg>
                          <span style={{ fontSize: '11px', color: '#92969D', flex: 'none' }}>{r.prefix}</span>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: r.nameInk, whiteSpace: 'nowrap' }}>{r.name}</span>
                          <span style={{ flex: '1' }} />
                          {r.fav ? (
                            <>
                              <svg width="9" height="9" viewBox={'0 0 24 24'} fill="#FF9F1C" style={{ flex: 'none' }}>
                                <path d="M12 3 L14.5 9 L21 9.3 L16 13.5 L17.7 20 L12 16.2 L6.3 20 L8 13.5 L3 9.3 L9.5 9 Z" />
                              </svg>
                            </>
                          ) : null}
                          {r.dot ? (
                            <>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.dot, flex: 'none' }} />
                            </>
                          ) : null}
                          <span style={{ fontSize: '9px', color: '#92969D', whiteSpace: 'nowrap', flex: 'none' }}>{r.sub}</span>
                        </div>
                      </>
                    ) : null}
                  </Fragment>
                ))}
              </div>
              <div style={{ height: '26px', flex: 'none', display: 'flex', alignItems: 'center', padding: '0 10px', background: '#2B2D31', borderTop: '1px solid #45484E' }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: '#92969D' }}>16 built-in · 23 plug-ins</span>
              </div>
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', background: '#2B2D31', position: 'relative', border: '1px solid #141517', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '34px', flex: 'none', display: 'flex', borderBottom: '1px solid #141517', background: '#17181A' }}>
              <div style={{ width: '220px', flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid #141517' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', color: '#92969D' }}>OVERVIEW</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: '#82868C' }}>bar 1–17 / 97</span>
              </div>
              <div style={{ flex: '1', position: 'relative', overflow: 'hidden', background: '#17181A' }}>
                {mini.map((m, mI) => (
                  <Fragment key={mI}>
                    <div style={{ position: 'absolute', left: m.left, width: m.width, top: m.top, height: '2px', borderRadius: '1px', background: m.color, opacity: '.6' }} />
                  </Fragment>
                ))}
                <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: '0', width: '17.5%', border: '1px solid #A4A9B0', borderRadius: '2px', background: '#E8E9EB0D', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ height: '22px', flex: 'none', display: 'flex', background: '#2B2D31', borderBottom: '1px solid #45484E' }}>
              <div style={{ width: '220px', flex: 'none', boxSizing: 'border-box', borderRight: '1px solid #141517', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', color: '#82868C' }}>SECTIONS</span>
              </div>
              <div style={{ flex: '1', position: 'relative' }}>
                {sections.map((s, sI) => (
                  <Fragment key={sI}>
                    <div style={{ position: 'absolute', top: '3px', bottom: '3px', left: s.left, width: s.width, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 7px', borderLeft: `2px solid ${s.edge}`, background: s.bg, borderRadius: '0 3px 3px 0', boxSizing: 'border-box', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '.04em', color: s.ink, whiteSpace: 'nowrap' }}>{s.name}</span>
                      <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '8px', color: '#82868C' }}>{s.bars}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ height: '22px', flex: 'none', display: 'flex', background: '#2B2D31', borderBottom: '1px solid #141517' }}>
              <div style={{ width: '220px', flex: 'none', boxSizing: 'border-box', borderRight: '1px solid #141517', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px 0 12px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', color: '#82868C' }}>ZOOM</span>
                <span style={{ flex: '1' }} />
                <div style={{ width: '18px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #141517', borderRadius: '3px', fontSize: '10px', color: '#A4A9B0', boxSizing: 'border-box' }}>−</div>
                <div style={{ width: '18px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #141517', borderRadius: '3px', fontSize: '10px', color: '#A4A9B0', boxSizing: 'border-box' }}>+</div>
              </div>
              <div style={{ flex: '1', position: 'relative' }}>
                {ticks.map((t, tI) => (
                  <Fragment key={tI}>
                    <div style={{ position: 'absolute', top: '0', bottom: '0', left: t.left, borderLeft: `1px solid ${t.line}`, paddingLeft: '4px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: t.ink }}>{t.label}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {lanes.map((L, LI) => (
                <Fragment key={LI}>
                  <div style={{ display: 'flex', height: L.h, flex: 'none', borderBottom: `1px solid ${L.rule}`, boxSizing: 'border-box' }}>
                    <div onClick={L.onSelect} style={{ width: '220px', flex: 'none', boxSizing: 'border-box', padding: L.pad, borderRight: '1px solid #141517', background: L.headBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', left: L.spineX, top: '0', bottom: '0', width: '3px', background: L.color }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        {L.isGroup ? (
                          <>
                            <svg width="8" height="8" viewBox={'0 0 10 10'} fill="#A4A9B0" style={{ flex: 'none' }}>
                              <path d="M0 2.5 L10 2.5 L5 8 Z" />
                            </svg>
                          </>
                        ) : null}
                        <span style={{ fontSize: '11px', fontWeight: '600', color: L.nameInk, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.name}</span>
                        <span style={{ flex: '1' }} />
                        {L.isGroup ? (
                          <>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <div style={{ width: '15px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '8px', fontWeight: '600', color: '#A4A9B0', border: '1px solid #141517', boxSizing: 'border-box' }}>M</div>
                              <div style={{ width: '15px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '8px', fontWeight: '600', color: '#A4A9B0', border: '1px solid #141517', boxSizing: 'border-box' }}>S</div>
                            </div>
                          </>
                        ) : null}
                        <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '8px', fontWeight: '500', letterSpacing: '.06em', color: '#82868C' }}>{L.kind}</span>
                      </div>
                      {L.isTrack ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '17px', height: '15px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '9px', fontWeight: '600', color: '#A4A9B0', background: '#17181A', border: '1px solid #141517', boxSizing: 'border-box' }}>M</div>
                            <div style={{ width: '17px', height: '15px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '9px', fontWeight: '600', color: '#A4A9B0', background: '#17181A', border: '1px solid #141517', boxSizing: 'border-box' }}>S</div>
                            <div style={{ width: '17px', height: '15px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', background: '#17181A', border: '1px solid #141517', boxSizing: 'border-box' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5A3436' }} />
                            </div>
                            <div style={{ flex: '1', minWidth: '0', height: '15px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 6px', background: '#17181A', border: '1px solid #141517', borderRadius: '3px', boxSizing: 'border-box' }}>
                              <span style={{ fontSize: '9px', color: '#A4A9B0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.input}</span>
                              <span style={{ marginLeft: 'auto', fontSize: '7px', color: '#82868C' }}>▾</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ flex: '1', height: '4px', borderRadius: '2px', background: '#17181A', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: L.fader, borderRadius: '2px', background: '#82868C' }} />
                              <div style={{ position: 'absolute', top: '-3px', left: L.fader, width: '3px', height: '10px', borderRadius: '1px', background: '#C0C4C9', transform: 'translateX(-2px)' }} />
                            </div>
                            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '9px', color: '#A4A9B0', width: '28px', textAlign: 'right' }}>{L.gain}</span>
                            <div style={{ width: '30px', height: '4px', flex: 'none', borderRadius: '2px', background: '#17181A', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: L.meter, background: '#6CC673' }} />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div style={{ flex: '1', position: 'relative', overflow: 'hidden', background: L.laneBg }}>
                      <div style={{ position: 'absolute', inset: '0', backgroundImage: 'repeating-linear-gradient(90deg,#2A2C30 0 1px,transparent 1px 5.88235%)' }} />
                      {L.clips.map((c, cI) => (
                        <Fragment key={cI}>
                          <div style={{ position: 'absolute', top: '3px', bottom: '3px', left: c.left, width: c.width, borderRadius: '3px', overflow: 'hidden', boxSizing: 'border-box', background: c.fill, border: `1px solid ${c.stroke}` }}>
                            <div style={{ height: '2px', background: c.band }} />
                            <svg width="100%" height="100%" viewBox={c.viewBox} preserveAspectRatio={'none'} style={{ display: 'block', position: 'absolute', inset: '0' }}>
                              <path d={c.path} stroke={c.ink} strokeWidth={c.sw} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                            </svg>
                            {c.label ? (
                              <>
                                <div style={{ position: 'absolute', top: '5px', left: '6px', fontSize: '9px', fontWeight: '500', color: c.labelInk, whiteSpace: 'nowrap' }}>{c.label}</div>
                              </>
                            ) : null}
                          </div>
                        </Fragment>
                      ))}
                      {L.isMaster ? (
                        <>
                          <div style={{ position: 'absolute', left: '0', right: '0', top: '50%', height: '1px', background: '#45484E' }} />
                        </>
                      ) : null}
                    </div>
                  </div>
                </Fragment>
              ))}
              <div style={{ flex: '1', display: 'flex' }}>
                <div style={{ width: '220px', flex: 'none', borderRight: '1px solid #141517', background: '#2B2D31' }} />
                <div style={{ flex: '1', background: '#17181A', backgroundImage: 'repeating-linear-gradient(90deg,#2A2C30 0 1px,transparent 1px 5.88235%)' }} />
              </div>
            </div>
            <div style={{ height: '12px', flex: 'none', display: 'flex', borderTop: '1px solid #45484E', background: '#17181A' }}>
              <div style={{ width: '220px', flex: 'none', borderRight: '1px solid #141517' }} />
              <div style={{ flex: '1', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '3px', left: '4px', width: '17%', height: '5px', borderRadius: '3px', background: '#45484E' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: '56px', bottom: '12px', left: `calc(220px + (100% - 220px) * ${headFrac})`, width: '1px', background: '#FF9F1C', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '56px', left: `calc(220px + (100% - 220px) * ${headFrac})`, width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #FF9F1C', transform: 'translateX(-4.5px)', pointerEvents: 'none' }} />
          </div>
        </div>
        {/* The Devices panel as the real app draws it (captured from Nota at 2x). */}
        <img src={PANEL} alt="Devices panel: Nota Volt and Nota Delay" width={1656} height={320} draggable={false}
          style={{ display: 'block', width: '1656px', height: '320px', flex: 'none' }} />
        <div style={{ height: '12px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '10px', color: '#92969D' }}>Opened demo02.nota</span>
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '10px', color: '#82868C' }}>44100 Hz</span>
        </div>
      </div>
    </div>
  );
}
