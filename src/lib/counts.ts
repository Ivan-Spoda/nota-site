import DEVICES from "../features/devices/devices.json";

// Device counts for the copy, taken from the gallery so they move with it. Racks (Drum Rack)
// sit with the instruments in the gallery but are not counted as instruments.
const of = (category: string) => DEVICES.filter((d) => d.category === category);
export const COUNTS = {
  instruments: of("Instruments").filter((d) => !d.name.endsWith("Rack")).length,
  audioEffects: of("Audio effects").length,
  midiEffects: of("MIDI effects").length,
  devices: DEVICES.length,
};
