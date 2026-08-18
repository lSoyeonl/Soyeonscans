(() => {
  const cfg = window.SOYEON_SUPABASE_CONFIG || {};

  async function loadFallback() {
    const res = await fetch('data/manga.json?v=1.3.0', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Не удалось загрузить локальные данные (${res.status})`);
    return await res.json();
  }

  async function loadCatalog() {
    const client = window.soyeonSupabase;
    if (!client || !cfg.contentTable || !cfg.catalogId) return await loadFallback();
    try {
      const { data, error } = await client
        .from(cfg.contentTable)
        .select('data, updated_at')
        .eq('id', cfg.catalogId)
        .maybeSingle();
      if (error) throw error;
      if (data && Array.isArray(data.data)) return data.data;
    } catch (err) {
      console.warn('Soyeon Scans: Supabase read failed, using local fallback.', err);
    }
    return await loadFallback();
  }

  async function getVerifiedAdmin() {
    const client = window.soyeonSupabase;
    if (!client || !cfg.adminUid) return null;
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user) return null;
    return data.user.id === cfg.adminUid ? data.user : null;
  }

  async function requireAdmin({ redirect = true } = {}) {
    const user = await getVerifiedAdmin();
    if (!user && redirect) {
      const here = encodeURIComponent(location.pathname.split('/').pop() || 'admin.html');
      location.replace(`admin-login.html?next=${here}`);
    }
    return user;
  }

  async function saveCatalog(catalog) {
    const client = window.soyeonSupabase;
    const user = await getVerifiedAdmin();
    if (!client) throw new Error('Supabase не подключён.');
    if (!user) throw new Error('Нет прав администратора.');
    if (!Array.isArray(catalog)) throw new Error('Некорректный каталог.');

    const payload = {
      id: cfg.catalogId,
      data: catalog,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };
    const { error } = await client
      .from(cfg.contentTable)
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  window.SoyeonContent = Object.freeze({
    loadFallback,
    loadCatalog,
    getVerifiedAdmin,
    requireAdmin,
    saveCatalog
  });
})();
