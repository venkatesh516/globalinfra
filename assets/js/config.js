/* ===== SITE CONFIGURATION =====
   Fill in the real business details here. Anything left empty is shown
   as a clear placeholder on the site (nothing is invented). */
window.GIP_CONFIG = {
  phone: "",            // e.g. "+91XXXXXXXXXX"  -> enables click-to-call
  whatsapp: "",         // digits only with country code, e.g. "91XXXXXXXXXX"
  email: "",            // official email address
  address: "",          // verified office address
  hours: "",            // e.g. "Mon–Sat, 10:00 AM – 6:00 PM"
  mapEmbedUrl: "",      // Google Maps "Embed a map" iframe src (only after address is verified)
  heroVideo: "",        // optional: URL/path of your own hero video (MP4). Empty = bundled sample video
  // Backend endpoint that accepts JSON via POST (your server, Formspree, Web3Forms proxy, CRM webhook, etc.).
  // NEVER put secret API keys here – use a server-side proxy for anything secret.
  formEndpoint: ""
};
