/* BeiLegit: static price board. No server needed.
   Published listings come from data.js. Listings added in the form are kept in
   this browser (localStorage) until the admin adds them to data.js. */

const CATS = ["Health", "Education", "Transport", "Beauty and grooming", "Repairs and tech", "Printing and cyber", "Food and groceries", "Housing and utilities", "Professional services", "Other"];
const STORE_KEY = "beilegit.orgs.v1";
const $ = id => document.getElementById(id);
const S = { published: [], local: [], editing: null, rowSeq: 0 };

const kes = n => "KES " + Number(n).toLocaleString("en-KE");
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const day = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }); };
const allOrgs = () => [...S.published, ...S.local];

/* ---------- storage ---------- */
function loadLocal() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
}
function saveLocal() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S.local)); return true; }
  catch (e) { return false; }
}

/* ---------- routing ---------- */
function route() {
  const list = location.hash === "#list-prices";
  $("view-prices").hidden = list; $("view-list").hidden = !list;
  $("tab-prices").removeAttribute("aria-current"); $("tab-list").removeAttribute("aria-current");
  (list ? $("tab-list") : $("tab-prices")).setAttribute("aria-current", "page");
}
window.addEventListener("hashchange", route);

/* ---------- price board ---------- */
function fillSelect(sel, first, values) {
  const cur = sel.value; sel.textContent = "";
  [first, ...values].forEach((v, i) => { const o = el("option", null, v); o.value = i === 0 ? "" : v; sel.appendChild(o); });
  sel.value = values.includes(cur) ? cur : "";
}
function rows() {
  const out = [];
  for (const o of allOrgs()) for (const it of (Array.isArray(o.items) ? o.items : [])) {
    if (it && typeof it.price === "number") out.push({ o, it });
  }
  return out;
}
function badges(o, box) {
  if (o.verified) box.appendChild(el("span", "stamp", "Verified"));
  if (o.sample) box.appendChild(el("span", "chip", "Example"));
  if (o.local) box.appendChild(el("span", "chip", "Awaiting review"));
}
function renderBoard() {
  const orgs = allOrgs(), all = rows();
  fillSelect($("f-cat"), "All categories", CATS.filter(c => orgs.some(o => o.category === c)));
  fillSelect($("f-town"), "All towns", [...new Set(orgs.map(o => String(o.town || "").trim()).filter(Boolean))].sort());
  const q = $("q").value.trim().toLowerCase(), cat = $("f-cat").value, town = $("f-town").value, sort = $("f-sort").value;
  const r = all.filter(({ o, it }) => {
    if (cat && o.category !== cat) return false;
    if (town && String(o.town || "").trim() !== town) return false;
    if (!q) return true;
    return [it.name, o.name, o.town, o.category].some(t => String(t || "").toLowerCase().includes(q));
  });
  const by = {
    cheap: (a, b) => a.it.price - b.it.price,
    dear: (a, b) => b.it.price - a.it.price,
    new: (a, b) => String(b.o.updatedAt || "").localeCompare(String(a.o.updatedAt || "")),
    az: (a, b) => String(a.it.name).localeCompare(String(b.it.name))
  };
  r.sort(by[sort] || by.cheap);

  const st = $("status"), sum = $("summary"), list = $("list"); list.textContent = "";
  if (!all.length) { st.hidden = false; st.textContent = "No prices have been published yet. Organisations can add theirs under For organisations."; sum.hidden = true; return; }
  if (!r.length) { st.hidden = false; st.textContent = "Nothing matches that search. Try a shorter word or clear the filters."; sum.hidden = true; return; }
  st.hidden = true; sum.hidden = false; sum.textContent = "";
  const prices = r.map(x => x.it.price);
  const add = (label, val) => { const s = el("span", null, label + " "); s.appendChild(el("b", null, val)); sum.appendChild(s); };
  add("Prices", String(r.length)); add("Organisations", String(new Set(r.map(x => x.o.id)).size));
  if (q || cat || town) { add("Lowest", kes(Math.min(...prices))); add("Highest", kes(Math.max(...prices))); }

  for (const { o, it } of r.slice(0, 300)) {
    const li = el("li"), b = el("button", "row"); b.type = "button";
    const left = el("div");
    left.appendChild(el("div", "item", it.name));
    const org = el("div", "org"); org.appendChild(el("span", null, o.name)); badges(o, org);
    left.appendChild(org);
    left.appendChild(el("div", "meta", [o.town, o.category, it.kind === "product" ? "Product" : "Service"].filter(Boolean).join(" · ")));
    const tag = el("div", "tag", kes(it.price)); if (it.unit) tag.appendChild(el("small", null, it.unit));
    b.append(left, tag); b.addEventListener("click", () => openOrg(o.id));
    li.appendChild(b); list.appendChild(li);
  }
}
["q", "f-cat", "f-town", "f-sort"].forEach(id => $(id).addEventListener("input", renderBoard));

/* ---------- organisation dialog ---------- */
function openOrg(id) {
  const o = allOrgs().find(x => x.id === id); if (!o) return;
  const body = $("org-body"); body.textContent = "";
  const h = el("h2", null, o.name); h.id = "d-name"; body.appendChild(h);
  const bd = el("div", "org"); bd.style.marginTop = "6px"; badges(o, bd);
  if (bd.children.length) body.appendChild(bd);
  body.appendChild(el("div", "where", [o.category, o.town].filter(Boolean).join(" · ") + (o.updatedAt ? " · Updated " + day(o.updatedAt) : "")));
  if (o.about) body.appendChild(el("p", null, o.about));
  const t = el("table");
  for (const it of (o.items || [])) {
    const tr = el("tr"), a = el("td", null, it.name); a.appendChild(el("small", null, it.kind === "product" ? "Product" : "Service"));
    const p = el("td", "p", kes(it.price)); if (it.unit) p.appendChild(el("small", null, it.unit));
    tr.append(a, p); t.appendChild(tr);
  }
  body.appendChild(t);
  const c = el("div", "contact");
  if (o.phone) {
    c.append("Confirm with the organisation on ");
    const a = el("a", null, o.phone); a.href = "tel:" + o.phone.replace(/[^\d+]/g, ""); a.style.fontFamily = "var(--mono)"; a.style.fontWeight = "600"; a.style.color = "inherit";
    c.appendChild(a);
    c.append(". If you are asked for more than the listed price, show them this page.");
  } else c.textContent = "This organisation has not listed a phone number. Confirm the price at their premises before paying.";
  body.appendChild(c);
  const act = el("div", "actions");
  const x = el("button", "btn small primary", "Close"); x.type = "button"; x.addEventListener("click", () => $("org-dialog").close());
  act.appendChild(x); body.appendChild(act);
  $("org-dialog").showModal();
}
$("org-dialog").addEventListener("click", e => { if (e.target === $("org-dialog")) $("org-dialog").close(); });

/* ---------- organisation form ---------- */
function addItemRow(it) {
  const n = ++S.rowSeq, row = el("div", "itemrow");
  const f = (label, ctl) => { const l = el("label", "f", label); l.htmlFor = ctl.id; l.appendChild(ctl); return l; };
  const name = el("input"); name.id = "it-name-" + n; name.maxLength = 80; name.placeholder = "e.g. Passport photos"; name.value = it?.name || "";
  const kind = el("select"); kind.id = "it-kind-" + n;
  [["service", "Service"], ["product", "Product"]].forEach(([v, t]) => { const o = el("option", null, t); o.value = v; kind.appendChild(o); });
  kind.value = it?.kind || "service";
  const price = el("input"); price.id = "it-price-" + n; price.type = "number"; price.min = "0"; price.step = "1"; price.inputMode = "numeric"; price.value = it?.price ?? "";
  const unit = el("input"); unit.id = "it-unit-" + n; unit.maxLength = 30; unit.placeholder = "per session"; unit.value = it?.unit || "";
  const rm = el("button", "btn small danger", "Remove"); rm.type = "button";
  rm.addEventListener("click", () => { row.remove(); if (!$("items").children.length) addItemRow(); });
  row.append(f("Item name", name), f("Type", kind), f("Price (KES)", price), f("Unit", unit), rm);
  row._get = () => ({ name: name.value.trim(), kind: kind.value, price: price.value === "" ? NaN : Number(price.value), unit: unit.value.trim() });
  $("items").appendChild(row);
}
function resetForm(o) {
  S.editing = o ? o.id : null;
  $("form-title").textContent = o ? "Edit " + o.name : "Add an organisation";
  $("o-name").value = o?.name || ""; $("o-cat").value = o?.category || CATS[0]; $("o-town").value = o?.town || "";
  $("o-phone").value = o?.phone || ""; $("o-about").value = o?.about || "";
  $("items").textContent = ""; (o?.items?.length ? o.items : [null]).forEach(addItemRow);
  $("cancel-edit").hidden = !o; $("save").textContent = o ? "Save changes" : "Save prices";
}
function say(text, err) { const m = $("form-msg"); m.textContent = text; m.className = "msg" + (err ? " err" : ""); }

$("add-item").addEventListener("click", () => addItemRow());
$("cancel-edit").addEventListener("click", () => { resetForm(); say(""); });
$("org-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("o-name").value.trim(), town = $("o-town").value.trim();
  if (!name) return say("Enter the organisation name.", true);
  if (!town) return say("Enter the town or area.", true);
  const items = [...$("items").children].map(r => r._get()).filter(i => i.name || !isNaN(i.price));
  if (!items.length) return say("Add at least one product or service with a price.", true);
  for (const i of items) {
    if (!i.name) return say("Every price needs an item name.", true);
    if (isNaN(i.price) || i.price < 0) return say("Enter a price in shillings for " + i.name + ".", true);
  }
  const org = {
    id: S.editing || "org-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, category: $("o-cat").value, town, phone: $("o-phone").value.trim(), about: $("o-about").value.trim(),
    verified: false, local: true, updatedAt: new Date().toISOString().slice(0, 10), items
  };
  const i = S.local.findIndex(o => o.id === org.id);
  if (i >= 0) S.local[i] = org; else S.local.push(org);
  const kept = saveLocal();
  resetForm(); renderBoard(); renderMine();
  say(kept ? "Saved on this device. Send it to the BeiLegit admin to publish it for everyone."
           : "Saved for this visit only. Your browser blocked storage, so download data.js before leaving.", !kept);
});

function renderMine() {
  $("mine-panel").hidden = !S.local.length; const box = $("mine"); box.textContent = "";
  for (const o of S.local) {
    const m = el("div", "m"), info = el("div"); info.appendChild(el("b", null, o.name));
    info.appendChild(el("div", "msg", (o.items?.length || 0) + " prices · " + (o.town || "")));
    const act = el("div", "actions"); act.style.marginTop = "0";
    const ed = el("button", "btn small", "Edit"); ed.type = "button";
    ed.addEventListener("click", () => { resetForm(o); say(""); $("org-form").scrollIntoView({ block: "start" }); });
    const del = el("button", "btn small danger", "Delete"); del.type = "button";
    del.addEventListener("click", () => {
      if (del.dataset.armed !== "1") {
        del.dataset.armed = "1"; del.textContent = "Confirm delete";
        setTimeout(() => { del.dataset.armed = ""; del.textContent = "Delete"; }, 4000); return;
      }
      S.local = S.local.filter(x => x.id !== o.id); saveLocal();
      if (S.editing === o.id) resetForm();
      renderBoard(); renderMine();
    });
    act.append(ed, del); m.append(info, act); box.appendChild(m);
  }
}

/* ---------- export for publishing ---------- */
$("export").addEventListener("click", () => {
  const merged = allOrgs().map(o => { const c = { ...o }; delete c.local; return c; });
  const text = "/* BeiLegit published listings. Set verified: true after confirming an organisation. */\n" +
    "window.BEILEGIT_DATA = " + JSON.stringify(merged, null, 2) + ";\n";
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  const a = el("a"); a.href = url; a.download = "data.js"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("export-msg").textContent = "Downloaded. Replace data.js in the GitHub repository with this file to publish.";
});

/* ---------- boot ---------- */
(function boot() {
  S.published = Array.isArray(window.BEILEGIT_DATA) ? window.BEILEGIT_DATA : [];
  S.local = loadLocal().map(o => ({ ...o, local: true, verified: false }));
  const cat = $("o-cat"); CATS.forEach(c => { const o = el("option", null, c); o.value = c; cat.appendChild(o); });
  $("write-note").hidden = false;
  $("write-note").textContent = "How it works: add your prices below and they are saved on this device. The BeiLegit admin reviews each listing, then publishes it to the public board with a Verified stamp.";
  resetForm(); route(); renderBoard(); renderMine();
})();
