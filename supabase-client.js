(() => {
  const cfg = window.SOYEON_SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.publishableKey) {
    console.warn('Soyeon Scans: Supabase config is missing.');
    return;
  }
  if (!window.supabase?.createClient) {
    console.warn('Soyeon Scans: Supabase library did not load.');
    return;
  }
  window.soyeonSupabase = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();
