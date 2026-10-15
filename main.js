const USER = "pikatostes";
const $ = (s) => document.querySelector(s);
const root = document.documentElement;
let invert = "1";

// Tema claro / oscuro
$("#theme").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content =
      next === "dark" ? "#0e1117" : "#f4f6fa";

    try {
      localStorage.setItem("theme", next);
    } catch (e) { }

    render();
});
$("#year").textContent = new Date().getFullYear();

// Proyectos desde GitHub
let repos = [], lang = "", query = "";
const box = $("#projects");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (d) => new Date(d).toLocaleDateString("es-ES", { month: "short", year: "numeric" });

function render() {
  const q = query.toLowerCase();
  const list = repos.filter((r) =>
    (!lang || r.language === lang) &&
    (!q || `${r.name} ${r.language ?? ""} ${r.description ?? ""}`.toLowerCase().includes(q)));
  $("#repo-count").textContent = `${list.length} de ${repos.length} repos`;
  if (!list.length) { box.innerHTML = '<p class="empty">Ningún proyecto coincide con el filtro.</p>'; return; }
  box.innerHTML = list.map((r) => `
    <article class="card">
      <h3>${esc(r.name)}</h3>
      <p>${esc(r.description) || "Sin descripción todavía."}</p>
      <div class="meta">
        ${r.language ? `<span>${esc(r.language)}</span>` : ""}
        <span>★ ${r.stargazers_count}</span>
        <span>Actualizado ${fmt(r.pushed_at)}</span>
      </div>
      <div class="links2">
        <a href="${esc(r.html_url)}" target="_blank" rel="noopener"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" width="24" height="24" style="filter: brightness(0) invert(${root.dataset.theme === "dark" ? "1" : "0"});"
/></a>
        ${r.homepage ? `<a href="${esc(r.homepage)}" target="_blank" rel="noopener">Demo</a>` : ""}
      </div>
    </article>`).join("");
}

function filters() {
  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  $("#filters").innerHTML = ["Todos", ...langs].map((l, i) =>
    `<button class="chip" type="button" data-l="${i ? esc(l) : ""}" aria-pressed="${!i}">${esc(l)}</button>`).join("");
}
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  lang = b.dataset.l;
  $("#filters").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  render();
});
$("#search").addEventListener("input", (e) => { query = e.target.value.trim(); render(); });

box.innerHTML = '<div class="skel"></div>'.repeat(3);
fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`)
  .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then((data) => {
    repos = data.filter((r) => !r.fork && r.name !== `${USER}.github.io`)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    filters(); render();
  })
  .catch(() => {
    box.innerHTML = `<p class="empty">No se han podido cargar los proyectos. Puedes verlos directamente en <a href="https://github.com/${USER}">github.com/${USER}</a>.</p>`;
  });