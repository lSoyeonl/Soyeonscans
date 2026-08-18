const $ = (q, p = document) => p.querySelector(q);

(async () => {
  const existing = await window.SoyeonContent?.getVerifiedAdmin?.();
  if (existing) {
    const next = new URLSearchParams(location.search).get('next') || 'admin.html';
    location.replace(next);
    return;
  }

  const form = $('#adminLoginForm');
  const state = $('#loginState');
  const button = $('#loginButton');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const client = window.soyeonSupabase;
    if (!client) {
      state.textContent = 'Supabase не подключён.';
      state.className = 'login-state error';
      return;
    }
    const email = $('#adminEmail').value.trim();
    const password = $('#adminPassword').value;
    state.textContent = 'Проверяем доступ…';
    state.className = 'login-state';
    button.disabled = true;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data?.user;
      const adminUid = window.SOYEON_SUPABASE_CONFIG?.adminUid;
      if (!user || user.id !== adminUid) {
        await client.auth.signOut();
        throw new Error('Этот аккаунт не имеет прав администратора.');
      }
      const next = new URLSearchParams(location.search).get('next') || 'admin.html';
      location.replace(next);
    } catch (err) {
      state.textContent = err?.message || 'Не удалось войти.';
      state.className = 'login-state error';
      button.disabled = false;
    }
  });
})();
