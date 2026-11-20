/* BeiLegit admin: approve submissions, edit listings, produce data.js.
   Note: this is a static site. The password keeps casual visitors out of this
   screen. Nothing here can change the public site by itself: changes go live
   only when the downloaded data.js is committed to the GitHub repository. */
(function () {
  "use strict";
  const { CONFIG, CATS, published, $, el, sanitizeOrg, decodeSubmission, dataFileText, copyText, orgForm, openOrg, readStore, writeStore } = window.BL;
  const DRAFT = "beilegit.admin.draft.v1", PENDING = "beilegit.admin.pending.v1";
  const IDLE_MS = 10 * 60 * 1000;
  const root = $("admin");
  let unlocked = false, lastActive = 0, fails = 0, lockedUntil = 0;
  let draft = [], pending = [], tab = "pending";
  const clean = list => list.map(sanitizeOrg);
  const same = (a, b) => JSON.stringify(clean(a)) === JSON.stringify(clean(b));

  async function hash(pw) {
    const bytes = new TextEncoder().encode("beilegit-admin:" + pw);
    const buf = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /* ---------- sign in ---------- */
  function loginView(note) {
    unlocked = false; root.textContent = "";
    const form = el("form", "panel login"); form.noValidate = true;
    form.append(el("h2", null, "Admin sign in"), el("p", "sub", "For the BeiLegit administrator only. You are asked for the password every time this page opens, and after 10 minutes without activity."));
    const l = el("label", "f", "Password"); l.htmlFor = "admin-pw";
    const pw = el("input"); pw.type = "password"; pw.id = "admin-pw"; pw.autocomplete = "current-password"; l.appendChild(pw);
    const act = el("div", "actions"); const go = el("button", "btn primary", "Sign in"); go.type = "submit";
    const msg = el("span", "msg" + (note ? "" : ""), note || ""); msg.setAttribute("role", "status"); act.append(go, msg);
    form.append(l, act);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (Date.now() < lockedUntil) { msg.className = "msg err"; msg.textContent = "Too many attempts. Wait " + Math.ceil((lockedUntil - Date.now()) / 1000) + " seconds."; return; }
      if (!CONFIG.adminHash) { msg.className = "msg err"; msg.textContent = "No admin password is set in config.js."; return; }
      let ok = false;
      try { ok = (await hash(pw.value)) === CONFIG.adminHash; }
      catch (err) { msg.className = "msg err"; msg.textContent = "This browser cannot check the password here. Open the site over https."; return; }
      if (!ok) {
        fails++; pw.value = ""; msg.className = "msg err"; msg.textContent = "Wrong password.";
        if (fails >= 5) { lockedUntil = Date.now() + 30000; fails = 0; }
        return;
      }
      fails = 0; unlocked = true; lastActive = Date.now(); load(); render();
    });
    root.appendChild(form); pw.focus();
  }
  ["click", "keydown", "input"].forEach(ev => document.addEventListener(ev, () => { if (unlocked) lastActive = Date.now(); }));
  setInterval(() => { if (unlocked && Date.now() - lastActive > IDLE_MS) loginView("Signed out after 10 minutes without activity."); }, 15000);

  /* ---------- data ---------- */
  function load() {
    const d = readStore(DRAFT, null);
    draft = d && Array.isArray(d.orgs) && d.dirty ? clean(d.orgs) : clean(published);
    const p = readStore(PENDING, []); pending = Array.isArray(p) ? clean(p) : [];
  }
  const dirty = () => !same(draft, published);
  function persist() { writeStore(DRAFT, { dirty: dirty(), orgs: draft }); writeStore(PENDING, pending); }

  /* ---------- layout ---------- */
  function render() {
    root.textContent = "";
    const head = el("div", "adminhead");
    head.append(el("h2", null, "Admin"));
    const out = el("button", "btn small", "Sign out"); out.type = "button"; out.addEventListener("click", () => loginView("Signed out."));
    head.appendChild(out); root.appendChild(head);
    if (dirty()) {
      const n = el("div", "notice warn"); n.append("You have changes that are not on the public site yet. ");
      const b = el("button", "btn small primary", "Go to Publish"); b.type = "button"; b.addEventListener("click", () => { tab = "publish"; render(); });
      n.appendChild(b); root.appendChild(n);
    }
    const tabs = el("div", "tabs"); tabs.setAttribute("role", "tablist");
    [["pending", "Pending (" + pending.length + ")"], ["listings", "Listings (" + draft.length + ")"], ["add", "Add listing"], ["import", "Import submission"], ["publish", "Publish"], ["password", "Password"]]
      .forEach(([id, label]) => {
        const b = el("button", "tab", label); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(tab === id));
        b.addEventListener("click", () => { tab = id; render(); }); tabs.appendChild(b);
      });
    root.appendChild(tabs);
    const view = el("div"); root.appendChild(view);
    ({ pending: pendingView, listings: listingsView, add: addView, import: importView, publish: publishView, password: passwordView })[tab](view);
  }

  function row(o, buttons) {
    const m = el("div", "m"), info = el("div");
    const title = el("b", null, o.name);
    info.append(title, el("div", "msg", [o.category, o.town, o.items.length + " prices", o.verified ? "Verified" : "Not verified"].filter(Boolean).join(" · ")));
    const act = el("div", "actions"); act.style.marginTop = "0";
    const view = el("button", "btn small", "View"); view.type = "button"; view.addEventListener("click", () => openOrg(o));
    act.appendChild(view); buttons.forEach(b => act.appendChild(b)); m.append(info, act); return m;
  }
  const btn = (label, cls, fn) => { const b = el("button", "btn small" + (cls ? " " + cls : ""), label); b.type = "button"; b.addEventListener("click", () => fn(b)); return b; };
  const twoStep = (label, fn) => btn(label, "danger", b => {
    if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "Confirm " + label.toLowerCase(); setTimeout(() => { b.dataset.armed = ""; b.textContent = label; }, 4000); return; }
    fn();
  });
  function uniqueId(o) { while (draft.some(x => x.id === o.id) || pending.some(x => x !== o && x.id === o.id)) o.id = "org-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); return o; }

  /* ---------- pending ---------- */
  function pendingView(view) {
    const p = el("div", "panel"); p.append(el("h2", null, "Waiting for your approval"), el("p", "sub", "Submissions you have imported. Check each one against the organisation before approving. Approved listings get the Verified stamp."));
    if (!pending.length) p.appendChild(el("p", "msg", "Nothing is waiting. Use Import submission when an organisation sends you an approval code."));
    const list = el("div", "mine");
    pending.forEach(o => list.appendChild(row(o, [
      btn("Approve", "primary", () => { pending = pending.filter(x => x !== o); o.verified = true; draft.push(uniqueId(o)); persist(); render(); }),
      btn("Edit", "", () => editIn(view, o, saved => { pending[pending.indexOf(o)] = saved; persist(); render(); })),
      twoStep("Reject", () => { pending = pending.filter(x => x !== o); persist(); render(); })
    ])));
    p.appendChild(list); view.appendChild(p);
  }

  /* ---------- listings ---------- */
  function listingsView(view) {
    const p = el("div", "panel"); p.append(el("h2", null, "All listings"), el("p", "sub", "Edit any price, add or remove the Verified stamp, or delete a listing."));
    const s = el("input"); s.type = "search"; s.id = "admin-search"; s.placeholder = "Search listings"; s.setAttribute("aria-label", "Search listings"); s.className = "adminsearch";
    const list = el("div", "mine");
    const draw = () => {
      list.textContent = ""; const t = s.value.trim().toLowerCase();
      draft.filter(o => !t || (o.name + " " + o.category + " " + o.town).toLowerCase().includes(t)).forEach(o => list.appendChild(row(o, [
        btn("Edit", "", () => editIn(view, o, saved => { draft[draft.indexOf(o)] = saved; persist(); render(); })),
        btn(o.verified ? "Remove stamp" : "Verify", "", () => { o.verified = !o.verified; persist(); render(); }),
        twoStep("Delete", () => { draft = draft.filter(x => x !== o); persist(); render(); })
      ])));
      if (!list.children.length) list.appendChild(el("p", "msg", "No listing matches."));
    };
    s.addEventListener("input", draw); p.append(s, list); view.appendChild(p); draw();
  }
  function editIn(view, org, done) {
    view.textContent = "";
    orgForm(view, { org, admin: true, saveLabel: "Save changes", onCancel: render, onSave: saved => { saved.id = org.id; done(saved); } });
    view.scrollIntoView({ block: "start" });
  }

  /* ---------- add ---------- */
  function addView(view) {
    orgForm(view, { admin: true, title: "Add a listing", saveLabel: "Add listing", onSave: saved => { draft.push(uniqueId(saved)); persist(); tab = "listings"; render(); } });
  }

  /* ---------- import ---------- */
  function importView(view) {
    const p = el("div", "panel");
    p.append(el("h2", null, "Import a submission"), el("p", "sub", "Paste the approval code an organisation sent you. It starts with BEILEGIT1: and goes into Pending for you to review."));
    const ta = el("textarea"); ta.rows = 6; ta.id = "import-code"; ta.setAttribute("aria-label", "Approval code"); ta.className = "adminsearch";
    const act = el("div", "actions"), msg = el("span", "msg"); msg.setAttribute("role", "status");
    act.append(btn("Add to Pending", "primary", () => {
      try { const o = decodeSubmission(ta.value); o.verified = false; o.official = false; pending.push(uniqueId(o)); persist(); tab = "pending"; render(); }
      catch (e) { msg.className = "msg err"; msg.textContent = "That code could not be read. Ask the organisation to copy the whole code and send it again."; }
    }), msg);
    p.append(ta, act); view.appendChild(p);
  }

  /* ---------- publish ---------- */
  function publishView(view) {
    const p = el("div", "panel");
    p.appendChild(el("h2", null, "Publish to the public site"));
    const added = draft.filter(o => !published.some(x => x.id === o.id)).length;
    const removed = published.filter(o => !draft.some(x => x.id === o.id)).length;
    const changed = draft.filter(o => { const x = published.find(y => y.id === o.id); return x && !same([o], [x]); }).length;
    p.appendChild(el("p", "sub", dirty() ? "Ready to publish: " + added + " new, " + changed + " edited, " + removed + " removed." : "The public site already matches your listings. Nothing to publish."));
    const ol = el("ol", "steps");
    ["Download data.js below.", "Open your BeiLegit repository on GitHub and upload the file, replacing the old data.js.", "Commit the change. The public site updates within a few minutes."].forEach(t => ol.appendChild(el("li", null, t)));
    p.appendChild(ol);
    const text = dataFileText(draft), act = el("div", "actions"), msg = el("span", "msg"); msg.setAttribute("role", "status");
    act.append(btn("Download data.js", "primary", () => {
      const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
      const a = el("a"); a.href = url; a.download = "data.js"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); msg.textContent = "Downloaded. Upload it to GitHub to go live.";
    }), btn("Copy file contents", "", b => copyText(text, b)));
    if (dirty()) act.appendChild(twoStep("Discard changes", () => { draft = clean(published); persist(); render(); }));
    act.appendChild(msg); p.appendChild(act);
    p.appendChild(el("p", "msg", "Only someone who can commit to the GitHub repository can change the public site. Keep that account secured with two-factor authentication."));
    view.appendChild(p);
  }

  /* ---------- password ---------- */
  function passwordView(view) {
    const p = el("div", "panel");
    p.append(el("h2", null, "Change the admin password"), el("p", "sub", "Choose a long password, at least 12 characters. The site stores only a locked form of it."));
    const l = el("label", "f", "New password"); l.htmlFor = "new-pw"; const pw = el("input"); pw.type = "password"; pw.id = "new-pw"; pw.autocomplete = "new-password"; l.appendChild(pw);
    const out = el("div"); const act = el("div", "actions");
    act.appendChild(btn("Create new password line", "primary", async () => {
      out.textContent = "";
      if (pw.value.length < 12) { out.appendChild(el("p", "msg err", "Use at least 12 characters.")); return; }
      const line = 'adminHash: "' + (await hash(pw.value)) + '"';
      const ta = el("textarea"); ta.readOnly = true; ta.rows = 3; ta.value = line; ta.className = "adminsearch"; ta.id = "pw-line"; ta.setAttribute("aria-label", "New password line");
      out.append(el("p", null, "In config.js on GitHub, replace the adminHash line with this one and commit. The new password works once the site updates."), ta, btn("Copy line", "", b => copyText(line, b)));
    }));
    p.append(l, act, out); view.appendChild(p);
  }

  loginView();
})();
