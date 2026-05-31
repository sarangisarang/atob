// Single source of truth for backend URL.
// PRODUCTION — points to the live VPS (Hetzner, HTTPS via Let's Encrypt).
// For local dev, temporarily swap to a tunnel URL; revert before building the APK.
export const API_BASE_URL = 'https://api.atobtransport.de';
