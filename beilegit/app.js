/* BeiLegit shared code: header, footer, price board, organisation form.
   Plain JavaScript, no server. Published prices come from data.js. */
(function () {
  "use strict";

  const CONFIG = Object.assign({ ceo: "", ceoTitle: "", email: "", phone: "", whatsapp: "", location: "", adminHash: "" }, window.BEILEGIT_CONFIG || {});

  const SECTORS = [
    { id: "health", file: "health.html", nav: "Health", title: "Medicines and healthcare",
      blurb: "Medicines, hospital bills, scans, lab tests and SHA cover.",
      cats: ["Medicines", "Hospital and clinic services", "Laboratory tests and scans", "Health insurance"] },
    { id: "government", file: "government.html", nav: "Government", title: "Government services",
      blurb: "Passports, IDs, certificates, licences and business registration.", cats: ["Government services"] },
    { id: "mobile", file: "mobile-money.html", nav: "Mobile money", title: "Mobile money and airtime",
      blurb: "M-PESA and Airtel Money charges, call and SMS rates.", cats: ["Mobile money and airtime"] },
    { id: "transport", file: "transport.html", nav: "Transport", title: "Transport",
      blurb: "Train fares and road tolls.", cats: ["Transport"] },
    { id: "energy", file: "energy.html", nav: "Fuel and power", title: "Fuel and electricity",
      blurb: "Pump price caps and electricity rates.", cats: ["Fuel and energy"] },
    { id: "more", file: "more.html", nav: "Shops and services", title: "Shops and other services",
      blurb: "Parks, schools, salons, repairs, printing, food and more.",
      cats: ["Tourism and parks", "Education", "Beauty and grooming", "Repairs and tech", "Printing and cyber", "Food and groceries", "Housing and utilities", "Professional services", "Other"] }
  ];
  const CATS = SECTORS.flatMap(s => s.cats);
  const LOCAL_KEY = "beilegit.orgs.v1";

  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const link = (href, text, cls) => { const a = el("a", cls, text); a.href = href; return a; };
  const kes = n => Number(n) === 0 ? "Free" : "KES " + Number(n).toLocaleString("en-KE", { maximumFractionDigits: 2 });
  const day = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }); };
  const published = Array.isArray(window.BEILEGIT_DATA) ? window.BEILEGIT_DATA : [];

  function readStore(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  /* Keeps only known fields with safe types. Used on anything typed or imported. */
  function sanitizeOrg(o) {
    const str = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
    const items = (Array.isArray(o && o.items) ? o.items : []).slice(0, 200).map(i => ({
      name: str(i && i.name, 80), kind: i && i.kind === "product" ? "product" : "service",
      price: Number(i && i.price), unit: str(i && i.unit, 30)
    })).filter(i => i.name && isFinite(i.price) && i.price >= 0);
    const src = str(o && o.source, 300);
    return {
      id: str(o && o.id, 60).replace(/[^a-zA-Z0-9_-]/g, "") || "org-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: str(o && o.name, 80), category: CATS.includes(o && o.category) ? o.category : "Other",
      town: str(o && o.town, 60), phone: str(o && o.phone, 20), about: str(o && o.about, 400),
      official: !!(o && o.official), verified: !!(o && o.verified),
      source: /^https:\/\//.test(src) ? src : "",
      updatedAt: str(o && o.updatedAt, 10) || new Date().toISOString().slice(0, 10), items
    };
  }
  const encodeSubmission = o => "BEILEGIT1:" + btoa(unescape(encodeURIComponent(JSON.stringify(sanitizeOrg(o)))));
  function decodeSubmission(text) {
    const t = String(text || "").trim();
    const m = t.match(/BEILEGIT1:([A-Za-z0-9+/=]+)/);
    const raw = m ? decodeURIComponent(escape(atob(m[1]))) : t;
    const o = sanitizeOrg(JSON.parse(raw));
    if (!o.name || !o.items.length) throw new Error("empty");
    return o;
  }
  function dataFileText(orgs) {
    return "/* BeiLegit published listings. Generated from the admin page on " + new Date().toISOString().slice(0, 10) + ". */\n" +
      "window.BEILEGIT_DATA = " + JSON.stringify(orgs.map(sanitizeOrg), null, 2) + ";\n";
  }
  async function copyText(text, btn) {
    const done = ok => { if (btn) { const t = btn.textContent; btn.textContent = ok ? "Copied" : "Select and copy manually"; setTimeout(() => { btn.textContent = t; }, 2500); } };
    try { await navigator.clipboard.writeText(text); done(true); } catch (e) { done(false); }
  }

  /* ---------- header and footer ---------- */
  function chrome() {
    const here = location.pathname.split("/").pop() || "index.html";
    const head = $("site-header");
    if (head) {
      const bar = el("div", "wrap bar");
      const brand = link("index.html", "", "brand"); brand.setAttribute("aria-label", "BeiLegit home");
      brand.append("bei", el("span", "legit", "legit"));
      const act = el("div", "bar-actions");
      act.append(link("organisations.html", "List your prices", "btn small primary"), link("contact.html", "Contact", "btn small"));
      bar.append(brand, act);
      const nav = el("nav", "sectornav"); nav.setAttribute("aria-label", "Sectors");
      const inner = el("div", "wrap");
      [{ file: "index.html", nav: "Home" }, ...SECTORS].forEach(s => {
        const a = link(s.file, s.nav); if (s.file === here) a.setAttribute("aria-current", "page"); inner.appendChild(a);
      });
      nav.appendChild(inner); head.append(bar, nav);
    }
    const foot = $("site-footer");
    if (foot) {
      const grid = el("div", "wrap footgrid");
      const a = el("div");
      a.append(el("div", "foot-brand", "BeiLegit"), el("p", null, "A public record of fixed prices in Kenya. Organisations publish what they charge, so citizens can check the real price before they pay."));
      const b = el("div"); b.appendChild(el("h2", null, "Sectors"));
      const ul = el("ul"); SECTORS.forEach(s => { const li = el("li"); li.appendChild(link(s.file, s.title)); ul.appendChild(li); }); b.appendChild(ul);
      const c = el("div"); c.appendChild(el("h2", null, "Contact"));
      contactLines(c);
      const more = el("p"); more.appendChild(link("contact.html", "Contact page and how to report an overcharge")); c.appendChild(more);
      grid.append(a, b, c);
      const base = el("div", "wrap footbase");
      base.append(el("span", null, "© " + new Date().getFullYear() + " BeiLegit. Prices are shown as published by each organisation or official source. Confirm before you pay."),
        link("admin.html", "Admin sign in"));
      foot.append(grid, base);
    }
  }
  function contactLines(box) {
    if (CONFIG.ceo) { const p = el("p"); p.append(el("strong", null, CONFIG.ceo)); if (CONFIG.ceoTitle) p.append(el("br"), CONFIG.ceoTitle); box.appendChild(p); }
    const ul = el("ul");
    const row = (label, node) => { const li = el("li"); li.append(label + ": ", node); ul.appendChild(li); };
    if (CONFIG.email) row("Email", link("mailto:" + CONFIG.email, CONFIG.email));
    if (CONFIG.phone) row("Phone", link("tel:" + CONFIG.phone.replace(/[^\d+]/g, ""), CONFIG.phone));
    if (CONFIG.whatsapp) row("WhatsApp", link("https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, ""), "+" + CONFIG.whatsapp.replace(/\D/g, "")));
    if (CONFIG.location) row("Location", document.createTextNode(CONFIG.location));
    box.appendChild(ul);
  }

  /* ---------- organisation dialog ---------- */
  function badges(o, box) {
    if (o.verified) box.appendChild(el("span", "stamp", "Verified"));
    if (o.official) box.appendChild(el("span", "chip", "Official rate"));
  }
  function openOrg(o) {
    const dlg = $("org-dialog"), body = $("org-body"); if (!dlg || !o) return;
    body.textContent = "";
    const h = el("h2", null, o.name); h.id = "d-name"; body.appendChild(h);
    const bd = el("div", "org"); bd.style.marginTop = "6px"; badges(o, bd); if (bd.children.length) body.appendChild(bd);
    body.appendChild(el("div", "where", [o.category, o.town].filter(Boolean).join(" · ") + (o.updatedAt ? " · Checked " + day(o.updatedAt) : "")));
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
      const a = link("tel:" + o.phone.replace(/[^\d+]/g, ""), o.phone, "mono"); c.appendChild(a);
      c.append(". If you are asked for more than the listed price, show them this page.");
    } else c.textContent = "If you are asked for more than the listed price, show them this page" + (o.source ? " and the official source." : ".");
    body.appendChild(c);
    if (o.source) {
      const s = el("p", "where", "Source: ");
      const a = link(o.source, o.source.replace(/^https:\/\/(www\.)?/, "").split("/")[0]); a.target = "_blank"; a.rel = "noopener";
      s.appendChild(a); body.appendChild(s);
    }
    const act = el("div", "actions"); const x = el("button", "btn small primary", "Close"); x.type = "button";
    x.addEventListener("click", () => dlg.close()); act.appendChild(x); body.appendChild(act);
    dlg.showModal();
  }

  /* ---------- price board ---------- */
  function board(opts) {
    const cats = opts.cats || null;
    const orgs = published.filter(o => !cats || cats.includes(o.category));
    const all = [];
    for (const o of orgs) for (const it of (Array.isArray(o.items) ? o.items : [])) if (it && typeof it.price === "number") all.push({ o, it });
    const q = $("q"), fCat = $("f-cat"), fTown = $("f-town"), fSort = $("f-sort"), st = $("status"), sum = $("summary"), list = $("list");

    const fill = (sel, first, values) => {
      sel.textContent = "";
      [first, ...values].forEach((v, i) => { const o = el("option", null, v); o.value = i === 0 ? "" : v; sel.appendChild(o); });
    };
    const catList = cats ? cats : CATS.filter(c => orgs.some(o => o.category === c));
    fill(fCat, "All categories", catList);
    fCat.hidden = catList.length < 2 || !!opts.chips;
    fill(fTown, "All towns", [...new Set(orgs.map(o => String(o.town || "").trim()).filter(Boolean))].sort());

    if (opts.chips && $("chips")) {
      const box = $("chips");
      const mk = (label, value) => {
        const n = value ? all.filter(r => r.o.category === value).length : all.length;
        const b = el("button", "chipbtn", label + " "); b.type = "button"; b.appendChild(el("span", null, String(n)));
        b.setAttribute("aria-pressed", String(fCat.value === value));
        b.addEventListener("click", () => { fCat.value = value; [...box.children].forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); render(); });
        box.appendChild(b);
      };
      mk("All", ""); cats.forEach(c => mk(c, c));
    }

    function render() {
      const term = q.value.trim().toLowerCase(), cat = fCat.value, town = fTown.value;
      list.textContent = ""; sum.hidden = true; st.hidden = true; st.textContent = "";
      if (opts.requireQuery && !term) { if ($("browse")) $("browse").hidden = false; return; }
      if ($("browse")) $("browse").hidden = !!term;
      const r = all.filter(({ o, it }) => {
        if (cat && o.category !== cat) return false;
        if (town && String(o.town || "").trim() !== town) return false;
        return !term || [it.name, o.name, o.town, o.category].some(t => String(t || "").toLowerCase().includes(term));
      });
      const by = {
        cheap: (a, b) => a.it.price - b.it.price, dear: (a, b) => b.it.price - a.it.price,
        org: (a, b) => String(a.o.name).localeCompare(String(b.o.name)), az: (a, b) => String(a.it.name).localeCompare(String(b.it.name))
      };
      if (by[fSort.value]) r.sort(by[fSort.value]);
      if (!r.length) {
        st.hidden = false;
        if (cat && !term && !town) {
          st.append("No prices are published under " + cat + " yet. If you offer these, ", link("organisations.html", "list your prices"), ".");
        } else st.textContent = all.length ? "Nothing matches that search. Try a shorter word or clear the filters." : "No prices are published in this sector yet.";
        return;
      }
      sum.hidden = false; sum.textContent = "";
      const add = (label, val) => { const s = el("span", null, label + " "); s.appendChild(el("b", null, val)); sum.appendChild(s); };
      add("Prices", String(r.length)); add("Organisations", String(new Set(r.map(x => x.o.id)).size));
      if (term) { const ps = r.map(x => x.it.price); add("Lowest", kes(Math.min(...ps))); add("Highest", kes(Math.max(...ps))); }
      for (const { o, it } of r.slice(0, 300)) {
        const li = el("li"), b = el("button", "row"); b.type = "button";
        const left = el("div"); left.appendChild(el("div", "item", it.name));
        const org = el("div", "org"); org.appendChild(el("span", null, o.name)); badges(o, org); left.appendChild(org);
        left.appendChild(el("div", "meta", [o.town, o.category].filter(Boolean).join(" · ")));
        const tag = el("div", "tag", kes(it.price)); if (it.unit) tag.appendChild(el("small", null, it.unit));
        b.append(left, tag); b.addEventListener("click", () => openOrg(o)); li.appendChild(b); list.appendChild(li);
      }
    }
    [q, fCat, fTown, fSort].forEach(x => x.addEventListener("input", render));
    render();
  }

  function sectorCards() {
    const box = $("sectors"); if (!box) return;
    SECTORS.forEach(s => {
      const orgs = published.filter(o => s.cats.includes(o.category));
      const n = orgs.reduce((t, o) => t + (o.items ? o.items.length : 0), 0);
      const a = link(s.file, "", "sector" + (s.id === "health" ? " lead" : ""));
      a.append(el("h3", null, s.title), el("p", null, s.blurb), el("span", "count", n + " prices · " + orgs.length + " sources"));
      box.appendChild(a);
    });
  }

  /* ---------- organisation form (public and admin) ---------- */
  let formSeq = 0;
  function orgForm(container, opts) {
    const p = "f" + (++formSeq) + "-", o = opts.org || null;
    container.textContent = "";
    const form = el("form", "panel"); form.noValidate = true;
    form.appendChild(el("h2", null, o ? "Edit " + o.name : (opts.title || "Add an organisation")));
    form.appendChild(el("p", "sub", "Prices are in Kenya shillings and must be the final amount a customer pays."));
    const field = (label, ctl, id) => { const l = el("label", "f", label); ctl.id = p + id; l.htmlFor = ctl.id; l.appendChild(ctl); return l; };
    const input = (val, max, ph) => { const i = el("input"); i.value = val || ""; if (max) i.maxLength = max; if (ph) i.placeholder = ph; return i; };
    const name = input(o && o.name, 80), town = input(o && o.town, 60, "e.g. Nakuru, or Countrywide"), phone = input(o && o.phone, 20, "07…");
    phone.inputMode = "tel";
    const cat = el("select"); CATS.forEach(c => { const op = el("option", null, c); op.value = c; cat.appendChild(op); });
    cat.value = (o && o.category) || opts.category || CATS[0];
    const g = el("div", "grid2");
    g.append(field("Organisation name", name, "name"), field("Category", cat, "cat"), field("Town or area", town, "town"), field("Customer phone", phone, "phone"));
    form.appendChild(g);
    const about = el("textarea"); about.rows = 2; about.maxLength = 400; about.value = (o && o.about) || "";
    const al = field("Short description", about, "about"); al.style.marginTop = "12px"; form.appendChild(al);

    let source, official, verified;
    if (opts.admin) {
      source = input(o && o.source, 300, "https://…"); source.type = "url";
      const sl = field("Source link (official tariff page)", source, "source"); sl.style.marginTop = "12px"; form.appendChild(sl);
      const checks = el("div", "checks");
      const check = (label, on, id) => { const l = el("label", "check"); const c = el("input"); c.type = "checkbox"; c.checked = !!on; c.id = p + id; l.append(c, " " + label); checks.appendChild(l); return c; };
      verified = check("Verified by BeiLegit", o && o.verified, "verified");
      official = check("Official published rate", o && o.official, "official");
      form.appendChild(checks);
    }

    form.appendChild(el("h3", "formh", "Products and services"));
    const items = el("div", "items"); form.appendChild(items);
    let rowSeq = 0;
    const addRow = it => {
      const n = ++rowSeq, row = el("div", "itemrow");
      const iname = input(it && it.name, 80, "e.g. Paracetamol 500mg, 10 tablets");
      const kind = el("select"); [["service", "Service"], ["product", "Product"]].forEach(([v, t]) => { const op = el("option", null, t); op.value = v; kind.appendChild(op); });
      kind.value = (it && it.kind) || "service";
      const price = el("input"); price.type = "number"; price.min = "0"; price.step = "0.01"; price.inputMode = "decimal"; price.value = it && it.price != null ? it.price : "";
      const unit = input(it && it.unit, 30, "per pack");
      const rm = el("button", "btn small danger", "Remove"); rm.type = "button";
      rm.addEventListener("click", () => { row.remove(); if (!items.children.length) addRow(); });
      row.append(field("Item name", iname, "in" + n), field("Type", kind, "ik" + n), field("Price (KES)", price, "ip" + n), field("Unit", unit, "iu" + n), rm);
      row._get = () => ({ name: iname.value.trim(), kind: kind.value, price: price.value === "" ? NaN : Number(price.value), unit: unit.value.trim() });
      items.appendChild(row);
    };
    ((o && o.items && o.items.length) ? o.items : [null]).forEach(addRow);
    const more = el("div", "actions"); const addBtn = el("button", "btn small", "Add another price"); addBtn.type = "button";
    addBtn.addEventListener("click", () => addRow()); more.appendChild(addBtn); form.appendChild(more);

    const act = el("div", "actions");
    const save = el("button", "btn primary", opts.saveLabel || "Save prices"); save.type = "submit";
    const msg = el("span", "msg"); msg.setAttribute("role", "status");
    act.appendChild(save);
    if (opts.onCancel) { const c = el("button", "btn", "Cancel"); c.type = "button"; c.addEventListener("click", opts.onCancel); act.appendChild(c); }
    act.appendChild(msg); form.appendChild(act);
    const say = (t, err) => { msg.textContent = t; msg.className = "msg" + (err ? " err" : ""); };

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!name.value.trim()) return say("Enter the organisation name.", true);
      if (!town.value.trim()) return say("Enter the town or area.", true);
      const rows = [...items.children].map(r => r._get()).filter(i => i.name || !isNaN(i.price));
      if (!rows.length) return say("Add at least one product or service with a price.", true);
      for (const i of rows) {
        if (!i.name) return say("Every price needs an item name.", true);
        if (isNaN(i.price) || i.price < 0) return say("Enter a price in shillings for " + i.name + ".", true);
      }
      if (source && source.value.trim() && !/^https:\/\//.test(source.value.trim())) return say("The source link must start with https://", true);
      opts.onSave(sanitizeOrg({
        id: o && o.id, name: name.value, category: cat.value, town: town.value, phone: phone.value, about: about.value,
        source: source ? source.value : (o && o.source), official: official ? official.checked : false,
        verified: verified ? verified.checked : false, updatedAt: new Date().toISOString().slice(0, 10), items: rows
      }));
    });
    container.appendChild(form);
    return { say };
  }

  /* ---------- "For organisations" page ---------- */
  function organisationsPage() {
    let mine = readStore(LOCAL_KEY, []); if (!Array.isArray(mine)) mine = [];
    mine = mine.map(sanitizeOrg);
    const box = $("mine"), panel = $("mine-panel"), formBox = $("form-box");
    let note = "";
    const newForm = org => {
      const f = orgForm(formBox, {
        org, onCancel: org ? () => newForm() : null,
        onSave: saved => {
          saved.verified = false; saved.official = false; saved.source = "";
          const i = mine.findIndex(x => x.id === saved.id); if (i >= 0) mine[i] = saved; else mine.push(saved);
          const kept = writeStore(LOCAL_KEY, mine);
          note = kept ? "Saved. Now send it to BeiLegit for approval." : "Saved for this visit only. Send it for approval before you close this page.";
          newForm(); renderMine(saved.id); panel.scrollIntoView({ block: "start" });
        }
      });
      if (!org && note) { f.say(note); note = ""; }
    };
    function renderMine(openId) {
      panel.hidden = !mine.length; box.textContent = "";
      for (const o of mine) {
        const wrap = el("div", "m-wrap"), m = el("div", "m"), info = el("div");
        info.append(el("b", null, o.name), el("div", "msg", o.items.length + " prices · " + o.town + " · Awaiting approval"));
        const act = el("div", "actions"); act.style.marginTop = "0";
        const send = el("button", "btn small primary", "Send for approval"); send.type = "button";
        const ed = el("button", "btn small", "Edit"); ed.type = "button";
        ed.addEventListener("click", () => { newForm(o); formBox.scrollIntoView({ block: "start" }); });
        const del = el("button", "btn small danger", "Delete"); del.type = "button";
        del.addEventListener("click", () => {
          if (del.dataset.armed !== "1") { del.dataset.armed = "1"; del.textContent = "Confirm delete"; setTimeout(() => { del.dataset.armed = ""; del.textContent = "Delete"; }, 4000); return; }
          mine = mine.filter(x => x.id !== o.id); writeStore(LOCAL_KEY, mine); renderMine();
        });
        act.append(send, ed, del); m.append(info, act);
        const sendBox = el("div", "sendbox"); sendBox.hidden = o.id !== openId;
        const code = encodeSubmission(o);
        sendBox.appendChild(el("p", null, "This approval code contains your listing. Send it to BeiLegit. Once the admin approves it, your prices appear on the public board."));
        const ta = el("textarea"); ta.readOnly = true; ta.rows = 3; ta.value = code; ta.id = "code-" + o.id; ta.setAttribute("aria-label", "Approval code");
        ta.addEventListener("focus", () => ta.select());
        const sa = el("div", "actions");
        const cp = el("button", "btn small", "Copy approval code"); cp.type = "button"; cp.addEventListener("click", () => { ta.select(); copyText(code, cp); });
        sa.appendChild(cp);
        const text = "BeiLegit listing for approval: " + o.name + "\n\n" + code;
        if (CONFIG.whatsapp) { const w = link("https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(text), "Send on WhatsApp", "btn small"); w.target = "_blank"; w.rel = "noopener"; sa.appendChild(w); }
        if (CONFIG.email) sa.appendChild(link("mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("BeiLegit listing: " + o.name) + "&body=" + encodeURIComponent(text), "Send by email", "btn small"));
        sendBox.append(ta, sa);
        if (!CONFIG.whatsapp && !CONFIG.email) sendBox.appendChild(el("p", "msg", "Copy the code and send it to the BeiLegit admin."));
        send.addEventListener("click", () => { sendBox.hidden = !sendBox.hidden; });
        wrap.append(m, sendBox); box.appendChild(wrap);
      }
    }
    newForm(); renderMine();
  }

  /* ---------- contact page ---------- */
  function contactPage() {
    const d = $("contact-details"); if (d) contactLines(d);
    if (d && !CONFIG.email && !CONFIG.phone && !CONFIG.whatsapp) d.appendChild(el("p", "msg", "Phone and email details will be published here shortly."));
    const form = $("contact-form"); if (!form) return;
    if (!CONFIG.email && !CONFIG.whatsapp) { form.hidden = true; return; }
    const out = $("contact-send");
    form.addEventListener("submit", e => {
      e.preventDefault(); out.textContent = "";
      const name = $("c-name").value.trim(), topic = $("c-topic").value, text = $("c-text").value.trim();
      if (!text) { out.appendChild(el("span", "msg err", "Write your message first.")); return; }
      const body = (name ? "From: " + name + "\n" : "") + "Topic: " + topic + "\n\n" + text;
      if (CONFIG.whatsapp) { const w = link("https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(body), "Send on WhatsApp", "btn primary"); w.target = "_blank"; w.rel = "noopener"; out.appendChild(w); }
      if (CONFIG.email) out.appendChild(link("mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("BeiLegit: " + topic) + "&body=" + encodeURIComponent(body), "Send by email", "btn"));
      out.appendChild(el("span", "msg", "Choose how to send. Your message opens in that app."));
    });
  }

  /* ---------- boot ---------- */
  window.BL = { CONFIG, SECTORS, CATS, published, $, el, link, kes, day, readStore, writeStore, sanitizeOrg, decodeSubmission, dataFileText, copyText, orgForm, openOrg };
  chrome();
  const dlg = $("org-dialog"); if (dlg) dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  const page = document.body.dataset.page;
  if (page === "home") { sectorCards(); board({ requireQuery: true }); }
  if (page === "sector") { const s = SECTORS.find(x => x.id === document.body.dataset.sector); if (s) board({ cats: s.cats, chips: s.cats.length > 1 }); }
  if (page === "organisations") organisationsPage();
  if (page === "contact") contactPage();
})();
