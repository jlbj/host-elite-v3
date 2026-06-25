/**
 * Reposition the GrapesJS device-selector panel to the far left so it
 * is never covered by a right-side (resizable) sidebar.
 *
 * Usage in craftjs-editor.component.ts after `editor = grapesjs.init(...)`:
 *   import { moveDevicesPanelLeft } from './grapesjs-reposition-devices-panel';
 *   moveDevicesPanelLeft(this.editor);
 */
export function moveDevicesPanelLeft(editor: any): void {
  const panel = editor.Panels?.getPanel?.('devices');
  if (!panel) {
    // Prefer silently exiting over throwing so the UI never crashes.
    return;
  }

  // Remove the old panel from GrapesJS's collection so it doesn't fight us.
  const panels = editor.Panels;
  panels.removePanel('devices');

  // Re-add with a custom class and explicit left positioning.
  panels.addPanel({
    id: 'devices',
    className: 'he-devices-left',
    visible: true,
    buttons: panel.get('buttons').models.map((btn: any) => ({
      id: btn.id,
      className: btn.get('className'),
      command: btn.get('command'),
      active: btn.get('active'),
      attributes: { title: btn.get('attributes')?.title || '' },
    })),
  });

  // Inject one-time CSS (idempotent).
  const cssId = 'he-devices-left-style';
  if (!document.getElementById(cssId)) {
    const styleEl = document.createElement('style');
    styleEl.id = cssId;
    styleEl.textContent = `
      .he-devices-left {
        position: absolute !important;
        left: 0 !important;
        right: auto !important;
        top: 0 !important;
        z-index: 99999 !important;
        width: auto !important;
      }
      .he-devices-left .gjs-pn-buttons {
        justify-content: flex-start !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}
