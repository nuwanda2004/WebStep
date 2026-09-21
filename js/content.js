/*
  Степь — загрузка контента.
  Весь текст, который может меняться (площадки, достижения, анонсы,
  видео, контакты), лежит в JSON-файлах в /content/ и редактируется
  через панель /admin/. Эти функции просто читают JSON и вставляют
  его в страницу — при правке в CMS ничего в этом файле трогать не надо.
*/

const Content = (() => {

  async function loadJSON(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("Не удалось загрузить " + path, err);
      return null;
    }
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  // ---------- Главная ----------

  async function renderHome() {
    const site = await loadJSON("content/site.json");
    if (site) {
      const logoImg = document.querySelector("[data-logo-img]");
      if (logoImg && site.logoImage) logoImg.src = site.logoImage;

      const logoText = document.querySelector("[data-logo-text]");
      if (logoText && !site.logoImage && site.logoText) logoText.textContent = site.logoText;

      const slogan = document.querySelector("[data-slogan]");
      if (slogan && site.slogan) slogan.textContent = site.slogan;

      const hero1 = document.querySelector("[data-hero-image]");
      if (hero1 && site.heroImage) hero1.src = site.heroImage;

      const hero2 = document.querySelector("[data-second-image]");
      if (hero2 && site.secondImage) hero2.src = site.secondImage;

      const heroBg = document.querySelector("[data-hero-bg]");
      if (heroBg && site.heroImage) heroBg.style.backgroundImage = `url('${site.heroImage}')`;

      const ctaBtn = document.querySelector("[data-cta-btn]");
      if (ctaBtn) {
        if (site.heroCta) ctaBtn.textContent = site.heroCta;
        if (site.heroCtaLink) ctaBtn.href = site.heroCtaLink;
      }
    }

    const about = await loadJSON("content/about.json");
    const teaser = document.querySelector("[data-about-teaser]");
    if (about && teaser && about.teaser) teaser.textContent = about.teaser;

    const venuesData = await loadJSON("content/venues.json");
    const venuesList = document.querySelector("[data-venues]");
    if (venuesData && venuesList) {
      venuesList.innerHTML = "";
      (venuesData.items || []).forEach(v => {
        venuesList.appendChild(el("li", "", esc(v.text)));
      });
    }

    const contacts = await loadJSON("content/contacts.json");
    const tgLink = document.querySelector("[data-telegram-handle]");
    if (contacts && tgLink && contacts.telegram) {
      tgLink.href = contacts.telegram;
      tgLink.textContent = contacts.telegram.replace(/^https?:\/\//, "");
    }
  }

  // ---------- О нас ----------

  async function renderAbout() {
    const about = await loadJSON("content/about.json");
    const box = document.querySelector("[data-about-full]");
    if (about && box) box.textContent = about.full || about.teaser || "";
  }

  // ---------- Достижения ----------

  async function renderAchievements() {
    const data = await loadJSON("content/achievements.json");
    const status = document.querySelector("[data-achievements-status]");
    if (data && status && data.status) status.textContent = data.status;

    const list = document.querySelector("[data-achievements-list]");
    if (data && list) {
      list.innerHTML = "";
      (data.items || []).forEach(item => {
        const li = el("li", "", "");
        const spark = el("span", "spark", "✨");
        const text = el("span", "", esc(item.text));
        li.appendChild(spark);
        li.appendChild(text);
        list.appendChild(li);
      });
    }
  }

  // ---------- Видео ----------

  function toEmbedUrl(url) {
    if (!url) return null;
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vk = url.match(/vk(?:\.ru|\.com)\/video(-?\d+_\d+)/);
    if (vk) return `https://vk.com/video_ext.php?oid=${vk[1].split("_")[0]}&id=${vk[1].split("_")[1]}`;
    return null;
  }

  async function renderVideo() {
    const data = await loadJSON("content/video.json");
    const grid = document.querySelector("[data-video-grid]");
    const empty = document.querySelector("[data-video-empty]");
    if (!data) return;
    const items = data.items || [];
    if (!items.length) {
      if (empty) empty.style.display = "block";
      if (grid) grid.style.display = "none";
      return;
    }
    if (empty) empty.style.display = "none";
    if (grid) {
      grid.style.display = "grid";
      grid.innerHTML = "";
      items.forEach(v => {
        const card = el("div", "video-card", "");
        const embed = toEmbedUrl(v.url);
        if (embed) {
          const frame = document.createElement("iframe");
          frame.src = embed;
          frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          frame.allowFullscreen = true;
          card.appendChild(frame);
        } else if (v.url) {
          const link = el("a", "", `<div style="padding:40px 14px;text-align:center;">Смотреть видео →</div>`);
          link.href = v.url;
          link.target = "_blank";
          link.rel = "noopener";
          card.appendChild(link);
        }
        card.appendChild(el("div", "video-card__title", esc(v.title || "")));
        grid.appendChild(card);
      });
    }
  }

  // ---------- Анонсы ----------

  async function renderAnnouncements() {
    const data = await loadJSON("content/announcements.json");
    const wrap = document.querySelector("[data-announcements]");
    const empty = document.querySelector("[data-announcements-empty]");
    if (!data) return;
    const items = data.items || [];
    if (!items.length) {
      if (empty) empty.style.display = "block";
      if (wrap) wrap.style.display = "none";
      return;
    }
    if (empty) empty.style.display = "none";
    if (wrap) {
      wrap.style.display = "block";
      wrap.innerHTML = "";
      items.forEach(a => {
        const card = el("div", "announcement", "");
        if (a.date) card.appendChild(el("div", "announcement__date", esc(a.date)));
        card.appendChild(el("div", "announcement__title", esc(a.title || "")));
        if (a.text) card.appendChild(el("p", "announcement__text", esc(a.text)));
        wrap.appendChild(card);
      });
    }
  }

  // ---------- Контакты ----------

  async function renderContacts() {
    const data = await loadJSON("content/contacts.json");
    if (!data) return;
    const map = { vk: "[data-contact-vk]", telegram: "[data-contact-telegram]", max: "[data-contact-max]" };
    Object.keys(map).forEach(key => {
      const link = document.querySelector(map[key]);
      if (link && data[key]) {
        link.href = data[key];
        const label = link.querySelector("[data-contact-label]");
        if (label) label.textContent = data[key].replace(/^https?:\/\//, "");
      }
    });
  }

  return {
    renderHome, renderAbout, renderAchievements,
    renderVideo, renderAnnouncements, renderContacts
  };
})();
