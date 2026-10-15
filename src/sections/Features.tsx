import { Stems } from "../features/Stems";
import { History } from "../features/History";
import { AudioToMidi } from "../features/AudioToMidi";
import { DeviceGallery } from "../features/devices/DeviceGallery";
import { Plugins } from "../features/Plugins";
import { Mcp } from "../features/Mcp";
import { Remote } from "../features/Remote";
import { OpenSource } from "../features/OpenSource";
import { Contributors } from "../features/Contributors";

export function Features() {
  return (
    <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 28px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '120px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--eyebrow)' }}>01 · Features</div>
        <h2 style={{ margin: '0', fontSize: 'clamp(32px,4.4vw,52px)', fontWeight: '600', letterSpacing: '-.03em', lineHeight: '1.05', textWrap: 'balance' }}>Tools that usually cost extra, built in and running locally.</h2>
      </div>
      <Stems />
      <Remote />
      <DeviceGallery />
      <History />
      <AudioToMidi />
      <Plugins />
      <Mcp />
      <OpenSource />
      <Contributors />
    </section>
  );
}
