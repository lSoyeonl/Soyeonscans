Soyeon Scans v1.3.0 — PRIVATE ADMIN / SUPABASE

Что изменено:
- Публичные страницы больше не показывают ссылку «Админ».
- Добавлена закрытая страница admin-login.html.
- admin.html проверяет текущего пользователя через Supabase Auth и допускает только UID:
  fc2ab0ba-8509-444d-bad6-40f1c1812546
- Сохранение проектов, описаний, статусов, глав, читалок и примечаний идёт напрямую в public.soyeon_content.
- Публичный сайт читает каталог из Supabase; если запись manga_catalog пока отсутствует, используется data/manga.json как резерв.
- При первом сохранении из админки создаётся/обновляется запись id=manga_catalog.
- Publishable key находится в клиентском supabase-config.js; secret/service_role ключи НЕ используются.
- Версия ресурсов поднята до v1.3.0 для обхода кэша GitHub Pages.

Установка:
1. Наложить все файлы PATCH поверх корня репозитория Soyeonscans с заменой.
2. Дождаться GitHub Pages и выполнить Ctrl+F5.
3. Открыть напрямую: /admin-login.html
4. Войти своим Supabase e-mail и паролем.
5. В редакторе нажать «Сохранить на сайте» — данные сразу попадут в Supabase.

Важно:
- SQL для таблицы soyeon_content и RLS уже должен быть выполнен в Supabase.
- Не добавляйте sb_secret_... или service_role в GitHub.
