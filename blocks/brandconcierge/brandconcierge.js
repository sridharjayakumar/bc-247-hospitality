const MOUNT_ID = 'brand-concierge-mount';

/**
 * The vendored Brand Concierge runtime calls `.focus()` on its chat input when it
 * restores an active (sticky) session. A bare focus() scrolls the focused element
 * into view — and since the concierge mounts in the footer, that jumps the whole
 * page to the bottom on load. We can't edit the minified bundle, so we patch
 * HTMLElement.prototype.focus to default `preventScroll: true`, but ONLY for
 * elements inside the concierge mount. Everything else on the site is untouched.
 */
function suppressMountFocusScroll() {
  if (window.bcFocusScrollPatched) return;
  window.bcFocusScrollPatched = true;

  const nativeFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focus(options) {
    if (this.closest?.(`#${MOUNT_ID}`)) {
      nativeFocus.call(this, { ...options, preventScroll: true });
    } else {
      nativeFocus.call(this, options);
    }
  };
}

export default function decorate(block) {
  block.setAttribute('id', MOUNT_ID);
  suppressMountFocusScroll();
}
