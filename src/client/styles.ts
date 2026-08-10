/** One scoped stylesheet injected for the lifetime of the client activation. */
export const CSS = `
[data-ya-workspace-sidebar] { flex:1; min-height:0; display:flex; flex-direction:column; box-sizing:border-box; padding-right:var(--dsh-sidebar-inline-padding); color:var(--dsw-alias-label-primary); }
[data-ya-workspace-sidebar].ya-rail { padding-right:0; }
.ya-section-header { flex:none; height:36px; display:flex; align-items:center; justify-content:flex-end; gap:4px; padding-left:12px; margin-bottom:4px; box-sizing:border-box; color:var(--dsw-alias-label-tertiary); }
.ya-section-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; }
.ya-icon-button { flex:none; width:28px; height:28px; border:0; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-secondary); background:transparent; cursor:pointer; }
.ya-icon-button:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ya-search { flex:none; height:38px; margin:0 2px 10px; padding:0 14px; display:flex; align-items:center; gap:8px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:24px; background:var(--dsw-static-neutral-bluish-75); color:var(--dsw-alias-label-caption); }
body[data-ds-dark-theme] .ya-search { background:var(--dsw-static-neutral-bluish-900); }
.ya-search-input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; }
.ya-search-input::placeholder { color:var(--dsw-alias-label-tertiary); }
.ya-search-icon { flex:none; display:inline-flex; border:0; padding:0; color:inherit; background:transparent; }
.ya-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; margin-right:calc(-1 * var(--dsh-sidebar-inline-padding)); padding-right:var(--dsh-sidebar-inline-padding); }
.ya-recent { flex:none; padding-bottom:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
.ya-block-label { height:26px; display:flex; align-items:center; padding:0 8px; color:var(--dsw-alias-label-tertiary); font-size:12px; font-weight:600; letter-spacing:.02em; text-transform:uppercase; }
.ya-breadcrumb { flex:none; height:34px; display:flex; align-items:center; gap:2px; padding:0 6px; color:var(--dsw-alias-label-tertiary); font-size:13px; }
.ya-crumb { border:0; padding:4px 3px; border-radius:6px; background:transparent; color:inherit; font:inherit; cursor:default; min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
button.ya-crumb:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); cursor:pointer; }
.ya-scroll { flex:1; min-height:0; overflow-y:auto; padding-bottom:12px; }
.ya-row { position:relative; min-height:34px; display:flex; align-items:center; gap:6px; margin:1px 0; padding:0 7px; border-radius:9px; box-sizing:border-box; color:var(--dsw-alias-label-primary); cursor:pointer; user-select:none; }
.ya-row:hover, .ya-row.ya-menu-open { background:var(--dsw-alias-interactive-bg-hover); }
.ya-row.ya-selected { background:var(--dsw-alias-interactive-bg-selected); }
.ya-workspace-row { min-height:40px; }
.ya-row-main { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
.ya-row-line { display:flex; align-items:center; min-width:0; gap:6px; }
.ya-row-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; line-height:18px; }
.ya-row-meta { flex:none; color:var(--dsw-alias-label-tertiary); font-size:11px; white-space:nowrap; }
.ya-workspace-path { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-tertiary); font-size:11px; line-height:15px; }
.ya-row-actions { flex:none; display:flex; align-items:center; gap:2px; opacity:0; pointer-events:none; transition:opacity 120ms ease-out; }
.ya-row:hover .ya-row-actions, .ya-menu-open .ya-row-actions { opacity:1; pointer-events:auto; }
.ya-status-slot { flex:none; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-tertiary); }
.ya-recent .ya-row { min-height:31px; }
.ya-search-workspace { color:var(--dsw-alias-label-tertiary); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ya-empty, .ya-status { padding:18px 10px; color:var(--dsw-alias-label-tertiary); text-align:center; font-size:13px; }
.ya-warning { color:var(--dsw-alias-status-warning); }
.ya-rename-input { width:100%; height:38px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:9px; padding:0 11px; background:transparent; color:var(--dsw-alias-label-primary); outline:none; }
.ya-error { margin-top:8px; color:var(--dsw-alias-status-error); font-size:12px; }
.ya-drop-before::before, .ya-drop-after::after { content:''; position:absolute; left:8px; right:8px; height:2px; border-radius:2px; background:var(--dsw-alias-label-link); }
.ya-drop-before::before { top:-2px; } .ya-drop-after::after { bottom:-2px; }
.ya-rail .ya-section-header { padding-left:0; margin-bottom:12px; }
.ya-rail .ya-icon-button, .ya-rail .ya-search { width:36px; height:36px; padding:0; margin:0 0 12px; border-color:transparent; background:transparent; }
.ya-rail .ya-search { justify-content:center; }
.ya-rail .ya-search-icon { cursor:pointer; color:var(--dsw-alias-label-primary); }
.ya-picker-error { color:var(--dsw-alias-status-error); white-space:pre-wrap; }
@keyframes ya-slide-in-forward { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
@keyframes ya-slide-in-backward { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
.ya-level-enter-forward { animation:ya-slide-in-forward 180ms ease-out; }
.ya-level-enter-backward { animation:ya-slide-in-backward 180ms ease-out; }
`

/** Install the stylesheet and return its disposer. */
export function installStyles(): () => void {
  const style = document.createElement('style')
  style.setAttribute('data-ya-workspace-sidebar-style', '')
  style.textContent = CSS
  document.head.appendChild(style)
  return () => { style.remove() }
}
