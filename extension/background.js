/**
 * Brewery — Background Service Worker (MV3)
 * Popup is the primary UI — no side panel used (Dia reserves right panel for its own AI chat).
 */

// Keep service worker alive during offscreen document messaging
chrome.runtime.onMessage.addListener(() => {
  return true;
});
