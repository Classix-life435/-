/* =====================================================================
 *  12星座 占い  メインロジック
 *  - 誕生日 → 星座を判定し、結果カードを1枚表示
 *  - SNSシェア（X / Instagram / リンクコピー）
 *  - LINE友だち追加
 *  - 「お一人さま一度だけ」（localStorageで端末ごとに記録）
 * ===================================================================== */
(function () {
  "use strict";

  const cfg = window.APP_CONFIG || {};
  const STORAGE_KEY = "zodiac_fortune_done_v1";

  const screens = {
    input: document.getElementById("screen-input"),
    result: document.getElementById("screen-result"),
    used: document.getElementById("screen-used"),
  };

  const el = {
    form: document.getElementById("birth-form"),
    date: document.getElementById("birth-date"),
    error: document.getElementById("form-error"),
    img: document.getElementById("result-img"),
    jp: document.getElementById("result-jp"),
    en: document.getElementById("result-en"),
    catch: document.getElementById("result-catch"),
    shareX: document.getElementById("share-x"),
    shareIg: document.getElementById("share-ig"),
    shareCopy: document.getElementById("share-copy"),
    copiedToast: document.getElementById("copied-toast"),
    lineAdd: document.getElementById("line-add"),
    showSaved: document.getElementById("show-saved-btn"),
  };

  /* ---------- 画面切り替え ---------- */
  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove("is-active"));
    screens[name].classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 保存・読み出し ---------- */
  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function save(slug) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug: slug, at: Date.now() }));
    } catch (e) {
      /* localStorage が使えない環境では制限なしで続行 */
    }
  }

  /* ---------- 結果カードを描画 ---------- */
  function renderResult(z) {
    el.img.src = "assets/zodiac/" + z.slug + ".png";
    el.img.alt = z.jp + "（" + z.en + "）の星座カード";
    el.jp.textContent = z.jp;
    el.en.textContent = z.en;
    el.catch.textContent = z.catch;
    setupShare(z);
    show("result");
  }

  /* ---------- シェア設定 ---------- */
  function shareUrl() {
    const base = (cfg.shareBaseUrl && cfg.shareBaseUrl.trim()) || (location.origin + location.pathname);
    return base;
  }
  function setupShare(z) {
    const url = shareUrl();
    const text = (cfg.shareText || "私の星座は「{sign}」でした").replace("{sign}", z.jp);

    // X（旧Twitter）: Web Intent でテキスト＋URLを共有
    const xHref = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
    el.shareX.setAttribute("href", xHref);

    // Instagram: Webからフィード直接投稿はできないため、アカウントへ誘導
    el.shareIg.setAttribute("href", cfg.instagramUrl || "#");

    // リンクコピー
    el.shareCopy.onclick = function () {
      const shareLine = text + " " + url;
      copyToClipboard(shareLine);
    };

    // LINE 友だち追加
    el.lineAdd.setAttribute("href", cfg.lineAddUrl || "#");
  }

  function copyToClipboard(value) {
    const done = () => {
      el.copiedToast.hidden = false;
      setTimeout(() => { el.copiedToast.hidden = true; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
    } else {
      fallbackCopy(value, done);
    }
  }
  function fallbackCopy(value, done) {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 入力 → 占う ---------- */
  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    el.error.hidden = true;

    const val = el.date.value;
    if (!val) {
      el.error.textContent = "お誕生日を入力してください。";
      el.error.hidden = false;
      return;
    }
    const parts = val.split("-");
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const z = window.getZodiacByDate(month, day);
    if (!z) {
      el.error.textContent = "星座を判定できませんでした。日付をご確認ください。";
      el.error.hidden = false;
      return;
    }

    if (cfg.oncePerPerson) save(z.slug);
    renderResult(z);
  });

  /* ---------- 利用済み画面：前回の結果を見る ---------- */
  if (el.showSaved) {
    el.showSaved.addEventListener("click", function () {
      const saved = loadSaved();
      if (!saved) { show("input"); return; }
      const z = window.ZODIAC_DATA.find((x) => x.slug === saved.slug);
      if (z) renderResult(z);
    });
  }

  /* ---------- 初期表示 ---------- */
  function init() {
    const saved = loadSaved();
    if (cfg.oncePerPerson && saved) {
      show("used");
    } else {
      show("input");
    }
  }
  init();
})();
