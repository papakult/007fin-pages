(function () {
  'use strict';
  var config = document.currentScript;
  var id = Number(config && config.getAttribute('data-counter'));
  var policy = config && config.getAttribute('data-policy');
  if (!id || !policy || window.siteAnalyticsConsent) return;
  var key = 'site-analytics-consent-v1';
  var version = '2026-10-21';
  var duration = 180 * 24 * 60 * 60 * 1000;
  var active = false;
  var choice = null;
  var banner;
  var settings;
  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(key) || 'null');
      return saved && saved.version === version && saved.expiresAt > Date.now() &&
        (saved.status === 'accepted' || saved.status === 'rejected') ? saved.status : null;
    } catch (error) { return null; }
  }
  function forgetCookies() {
    document.cookie.split(';').forEach(function (item) {
      var name = item.split('=')[0].trim();
      if (!/^_ym_/.test(name)) return;
      var parts = location.hostname.split('.');
      var domains = ['', location.hostname, '.' + location.hostname];
      if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }
  function start() {
    if (active || choice !== 'accepted') return;
    active = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    window.ym(id, 'init', { clickmap: false, trackLinks: true, accurateTrackBounce: true, webvisor: false });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(tag);
  }
  function save(status) {
    choice = status;
    try {
      localStorage.setItem(key, JSON.stringify({ status: status, version: version,
        updatedAt: Date.now(), expiresAt: Date.now() + duration }));
    } catch (error) { /* If storage is unavailable, this choice applies to this page only. */ }
    banner.hidden = true;
    settings.hidden = false;
    if (status === 'accepted') start();
    else {
      var wasActive = active;
      active = false;
      if (wasActive && typeof window.ym === 'function') window.ym(id, 'destruct');
      forgetCookies();
      if (wasActive) location.reload();
    }
  }
  function show() {
    banner.hidden = false;
    settings.hidden = true;
  }
  // Events which happened before consent are discarded, never replayed after acceptance.
  window.trackYandexEvent = function (name, params) {
    if (choice === 'accepted' && active && typeof window.ym === 'function') {
      window.ym(id, 'reachGoal', name, params || {});
    }
  };
  window.siteAnalyticsConsent = { open: show, accepted: function () { return choice === 'accepted'; } };
  function mount() {
    var style = document.createElement('style');
    style.textContent = '.analytics-choice{position:fixed;bottom:16px;left:16px;z-index:2147483000;width:min(640px,calc(100vw - 32px));box-sizing:border-box;padding:20px;border:1px solid #a88a52;border-radius:16px;background:#faf7ef;color:#172238;box-shadow:0 10px 40px #0004;font:15px/1.5 system-ui,sans-serif}.analytics-choice[hidden],.analytics-settings[hidden]{display:none!important}.analytics-choice p{margin:0 0 14px;color:#172238}.analytics-choice a{color:#384b73;text-decoration:underline}.analytics-choice-actions{display:flex;flex-wrap:wrap;gap:10px}.analytics-choice button{flex:1;min-height:44px;padding:10px 16px;cursor:pointer;border:1px solid #76613c;border-radius:8px;background:#fff;color:#172238;font:600 14px/1.3 system-ui,sans-serif}.analytics-choice button:focus-visible,.analytics-settings:focus-visible{outline:3px solid #3b69a0;outline-offset:3px}.analytics-settings{position:fixed;bottom:12px;left:12px;z-index:2147482999;border:1px solid #a88a52;border-radius:8px;padding:9px 12px;min-height:44px;background:#faf7ef;color:#172238;cursor:pointer;font:13px/1.3 system-ui,sans-serif}@media(max-width:480px){.analytics-choice{padding:16px;bottom:10px;left:10px;width:calc(100vw - 20px);font-size:14px}.analytics-choice-actions{flex-direction:column}.analytics-choice button{width:100%}}';
    document.head.appendChild(style);
    banner = document.createElement('section');
    banner.className = 'analytics-choice';
    banner.setAttribute('aria-label', 'Выбор аналитики');
    banner.innerHTML = '<p><strong>Статистика посещений</strong></p><p>С вашего согласия ИП Шелест Андрей Анатольевич использует Яндекс Метрику для анализа посещаемости и улучшения сайта. Яндекс получает IP-адрес, cookie, сведения о браузере, страницах и действиях. Вебвизор отключен. Без согласия счетчик не загружается. <a href="' + policy + '#analytics-consent">Условия обработки и согласия</a></p><div class="analytics-choice-actions"><button type="button" data-analytics-accept>Согласен на аналитику</button><button type="button" data-analytics-reject>Продолжить без аналитики</button></div>';
    settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'analytics-settings';
    settings.textContent = 'Настройки аналитики';
    document.body.appendChild(banner);
    document.body.appendChild(settings);
    banner.querySelector('[data-analytics-accept]').addEventListener('click', function () { save('accepted'); });
    banner.querySelector('[data-analytics-reject]').addEventListener('click', function () { save('rejected'); });
    settings.addEventListener('click', show);
    choice = read();
    banner.hidden = choice !== null;
    settings.hidden = choice === null;
    if (choice === 'accepted') start();
    else forgetCookies();
    window.addEventListener('storage', function (event) {
      if (event.key !== key) return;
      var next = read();
      if (active && next !== 'accepted') { choice = next; active = false; window.ym(id, 'destruct'); forgetCookies(); location.reload(); return; }
      choice = next;
      banner.hidden = choice !== null;
      settings.hidden = choice === null;
      if (choice === 'accepted') start();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
