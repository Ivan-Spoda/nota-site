// The Nota main window shown in the hero: a 2x render of the real app in
// Studio Dark or Studio Light, following the site theme (the "Night Drive" demo
// with Lead selected). Laid out at a fixed
// 1680 px width; the Hero scales it to fit.
import { useShot } from "./lib/theme";

export function MainWindow() {
  const shot = useShot();
  return (
    <img src={shot("hero/main-window.avif")} width={1680} height={1050} fetchPriority="high" alt="Nota main window: browser, arrangement with the Night Drive demo, and the Devices panel showing Nota Volt and Nota Delay" style={{ display: 'block', width: '1680px', height: '1050px' }} />
  );
}
