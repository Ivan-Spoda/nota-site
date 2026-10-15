import { useEffect, useMemo, useState } from "react";
import DEVICES from "./devices.json";
import { useShot } from "../../lib/theme";
import { COUNTS } from "../../lib/counts";

// Device cards rendered headlessly from the app at 2x, in Studio Dark and Studio Light
// ("<id>-light.avif"); one view per tab, or per factory preset for devices without tabs.
type Device = { name: string; category: string; views: { label: string; src: string }[] };
const ALL = DEVICES as Device[];

const CATEGORIES = [
  { title: "Instruments", color: "#6A9FD8" },
  { title: "Audio effects", color: "#FF9F1C" },
  { title: "MIDI effects", color: "#B3B45E" },
];

// What each device is, as the app's browser describes it.
const KIND: Record<string, string> = {
  Synth: "subtractive synth", Volt: "analog synth", Aurora: "wavetable synth", Operator: "FM synth", Bass: "bass synth",
  Flux: "vector-morph synth", Grain: "granular synth", Pentad: "poly synth", Consort: "paraphonic synth", Monolith: "mono synth",
  Physical: "physical-modelling synth", Keys: "electric piano", Pendulum: "arp synth", Sampler: "sampler", Mosaic: "multisample instrument", "Drum Rack": "drum pads", Rhythm: "drum machine",
  "EQ-3": "3-band EQ", "EQ-8": "8-band EQ", "Dynamic EQ": "dynamic EQ", Compressor: "compressor", Ceiling: "limiter", Level: "gain and loudness",
  Prism: "multiband dynamics", Reverb: "reverb", Chamber: "hybrid reverb", Delay: "delay", Chorus: "chorus", Phaser: "phaser", Flanger: "flanger",
  Orbit: "auto-pan", "Auto Filter": "envelope / LFO filter", "Auto Shift": "pitch correction", Forge: "saturator", Valve: "amplifier",
  Vintage: "vintage saturator", Crush: "bit crusher", "Beat Repeat": "glitch and repeats", Shutter: "gate", Strata: "looper",
  Lens: "analyzer and scope", Utility: "utility", Arp: "arpeggiator", Chord: "chord generator", Scale: "scale quantizer",
  Length: "note length", Velocity: "velocity shaper", Random: "randomizer",
};

const mono = "'Geist Mono',monospace";

export function DeviceGallery() {
  const [cat, setCat] = useState(CATEGORIES[0].title);
  const [name, setName] = useState("Volt");
  const [view, setView] = useState(0);
  const shot = useShot();
  const inCat = useMemo(() => ALL.filter((d) => d.category === cat), [cat]);
  const dev = ALL.find((d) => d.name === name) ?? inCat[0];
  const color = CATEGORIES.find((c) => c.title === dev.category)!.color;
  const v = dev.views[Math.min(view, dev.views.length - 1)];

  const pick = (n: string) => { setName(n); setView(0); };
  const pickCat = (c: string) => { setCat(c); pick(ALL.find((d) => d.category === c)!.name); };
  const step = (dir: number) => {
    const i = inCat.findIndex((d) => d.name === dev.name);
    pick(inCat[(i + dir + inCat.length) % inCat.length].name);
  };

  // Warm the cache with the other views of this device and its neighbours.
  useEffect(() => {
    const i = inCat.findIndex((d) => d.name === dev.name);
    const near = [dev, inCat[(i + 1) % inCat.length], inCat[(i - 1 + inCat.length) % inCat.length]];
    near.forEach((d, k) => d.views.slice(0, k ? 1 : undefined).forEach((x) => { new Image().src = shot("devices/" + x.src); }));
  }, [dev, inCat, shot]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "48px", alignItems: "end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "520px" }}>
          <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--ink4)" }}>Instruments and effects</div>
          <h3 style={{ margin: 0, fontSize: "32px", fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.1 }}>{COUNTS.devices} devices in the box, each with live graphs and presets.</h3>
        </div>
        <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.65, color: "var(--ink3)", textWrap: "pretty", maxWidth: "520px" }}>Subtractive, FM, wavetable, granular, physical and vector synths, a sampler and two drum machines with 29 kits. Every effect shows what it does to the sound, and most ship with around 30 presets. Pick a device to see it.</p>
      </div>

      <div className="gallery" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "4px", padding: "16px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "16px", boxSizing: "border-box" }}>
        {/* Viewer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "2px 4px 0" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)" }}>Nota {dev.name}</span>
            <span style={{ fontFamily: mono, fontSize: "11px", color: "var(--ink4)" }}>{KIND[dev.name]}</span>
            <span style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: "4px" }}>
              {[-1, 1].map((d) => (
                <button key={d} className="g-arrow" onClick={() => step(d)} aria-label={d < 0 ? "Previous device" : "Next device"}
                  style={{ width: "30px", height: "28px", borderRadius: "3px", border: "1px solid var(--line)", background: "var(--raised)", color: "var(--ink2)", cursor: "pointer", fontSize: "14px" }}>{d < 0 ? "‹" : "›"}</button>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", aspectRatio: "700 / 260", borderRadius: "3px", overflow: "hidden", background: "var(--line)", border: "1px solid var(--line)" }}>
            <img key={v.src} src={shot("devices/" + v.src)} alt={`Nota ${dev.name} — ${v.label}`} width={1400} height={520} decoding="async"
              style={{ display: "block", width: "100%", height: "100%" }} />
          </div>
          {dev.views.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "3px", alignSelf: "flex-start", background: "var(--well)", border: "1px solid var(--hair)", borderRadius: "3px" }}>
              {dev.views.map((x, i) => (
                <button key={x.label} onClick={() => setView(i)}
                  style={{ height: "26px", padding: "0 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "Geist, system-ui, sans-serif", fontSize: "12px", fontWeight: 600, background: i === view ? "var(--accent)" : "transparent", color: i === view ? "var(--onAccent)" : "var(--ink3)" }}>{x.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
          <div style={{ display: "flex", padding: "3px", background: "var(--well)", border: "1px solid var(--hair)", borderRadius: "3px" }}>
            {CATEGORIES.map((c) => {
              const on = c.title === cat;
              return (
                <button key={c.title} onClick={() => pickCat(c.title)}
                  style={{ flex: 1, height: "28px", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "Geist, system-ui, sans-serif", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", background: on ? "var(--accent)" : "transparent", color: on ? "var(--onAccent)" : "var(--ink3)" }}>
                  {c.title.replace(" effects", " FX")} <span style={{ fontFamily: mono, fontWeight: 400, opacity: 0.7 }}>{ALL.filter((d) => d.category === c.title).length}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignContent: "flex-start" }}>
            {inCat.map((d) => {
              const on = d.name === dev.name;
              return (
                <button key={d.name} className="g-chip" onClick={() => pick(d.name)}
                  style={{ height: "28px", padding: "0 10px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "4px", cursor: "pointer", boxSizing: "border-box", fontFamily: "Geist, system-ui, sans-serif", fontSize: "12px", background: on ? "var(--accentSoft)" : "var(--well)", border: `1px solid ${on ? "var(--accentEdge)" : "var(--hair)"}`, color: on ? "var(--ink)" : "var(--ink2)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: CATEGORIES.find((c) => c.title === d.category)!.color }} />{d.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
