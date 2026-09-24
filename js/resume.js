/**
 * Make my Resume – packaging-industry focused wizard.
 * Templates are lazy-loaded from resume-templates.js only when this module loads
 * (and this module itself loads only when the user opens the Resume tab).
 */
import { $, $$, esc, toast } from "./utils.js";

const STEPS = ["Template", "Personal", "Experience", "Education", "Skills", "Preview"];

let TEMPLATES = [];
let HEADLINE_HINTS = {};
let SKILL_HINTS = {};
let SUMMARY_HINTS = {};
let CERT_HINTS = "";
let templatesReady = null;

/** Lazy-load packaging templates (separate chunk) */
function loadTemplates() {
  if (!templatesReady) {
    templatesReady = import("./resume-templates.js").then((mod) => {
      TEMPLATES = mod.TEMPLATES;
      HEADLINE_HINTS = mod.HEADLINE_HINTS;
      SKILL_HINTS = mod.SKILL_HINTS;
      SUMMARY_HINTS = mod.SUMMARY_HINTS;
      CERT_HINTS = mod.CERT_HINTS || "";
      return mod;
    });
  }
  return templatesReady;
}

const defaultData = () => ({
  template: "packops",
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
  experience: [{ company: "", title: "", start: "", end: "", bullets: "" }],
  education: [{ school: "", degree: "", year: "", detail: "" }],
  skills: "",
  certifications: "",
});

let data = defaultData();
let step = 0;
let meRef = null;

export async function initResume(me) {
  meRef = me;
  const root = $("#resumeRoot");
  if (root) root.innerHTML = `<div class="empty">Loading packaging resume templates…</div>`;

  try {
    await loadTemplates();
  } catch (e) {
    console.error(e);
    if (root) root.innerHTML = `<div class="empty">Could not load templates. Check your connection and try again.</div>`;
    toast("Failed to load resume templates");
    return;
  }

  if (me) {
    data.fullName = data.fullName || me.name || "";
    data.phone = data.phone || me.id || "";
    data.headline = data.headline || me.designation || "";
    if (me.company && !data.experience[0].company) {
      data.experience[0].company = me.company;
      data.experience[0].title = me.designation || "";
    }
  }
  render();
}

export function renderResumePage() {
  if (TEMPLATES.length) render();
  else initResume(meRef);
}

function render() {
  const root = $("#resumeRoot");
  if (!root) return;

  const stepsHtml = STEPS.map(
    (s, i) => `<span class="${i === step ? "on" : i < step ? "done" : ""}">${i + 1}. ${s}</span>`
  ).join("");

  let body = "";
  if (step === 0) body = renderTemplateStep();
  else if (step === 1) body = renderPersonalStep();
  else if (step === 2) body = renderExperienceStep();
  else if (step === 3) body = renderEducationStep();
  else if (step === 4) body = renderSkillsStep();
  else body = renderPreviewStep();

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  root.innerHTML = `
    <div class="resume-hero">
      <h3>Make my Resume</h3>
      <p>Packaging industry formats — choose a style, fill details step by step, download PDF-ready.</p>
    </div>
    <div class="wizard-steps">${stepsHtml}</div>
    <div class="card" id="wizardBody">${body}</div>
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
      ${!isFirst ? `<button type="button" class="btn ghost" id="resBack" style="width:auto;padding:12px 20px">← Back</button>` : ""}
      <button type="button" class="btn" id="resNext" style="width:auto;padding:12px 24px;flex:1;max-width:280px">${isLast ? "Download / Print" : "Continue →"}</button>
    </div>
  `;

  bindStepEvents();
}

function renderTemplateStep() {
  return `
    <h3 style="margin:0 0 4px;font-size:16px">Choose a packaging resume format</h3>
    <p style="color:var(--muted);font-size:13px;margin:0 0 12px">Designed for converters, brand packaging teams, and industry leaders.</p>
    <div class="tpl-grid">
      ${TEMPLATES.map(
        (t) => `
        <button type="button" class="tpl-card ${data.template === t.id ? "on" : ""}" data-tpl="${t.id}">
          <div class="tpl-preview"><div class="mini">${t.mini}</div></div>
          <div class="t">${esc(t.name)}</div>
          <div class="s">${esc(t.desc)}</div>
          <div class="s" style="margin-top:4px;font-weight:600;color:var(--pine2)">${esc(t.industry || "")}</div>
        </button>`
      ).join("")}
    </div>
  `;
}

function renderPersonalStep() {
  const hHint = HEADLINE_HINTS[data.template] || "";
  const sHint = SUMMARY_HINTS[data.template] || "";
  return `
    <h3 style="margin:0 0 12px;font-size:16px">About you</h3>
    <div class="field"><label>Full name *</label><input id="rName" maxlength="80" value="${esc(data.fullName)}" placeholder="e.g. Priya Sharma"></div>
    <div class="field">
      <label>Professional headline *</label>
      <input id="rHeadline" maxlength="120" value="${esc(data.headline)}" placeholder="${esc(hHint)}">
      ${hHint ? `<button type="button" class="link" id="useHeadlineHint" style="font-size:12px;padding:4px 0">Use suggested: ${esc(hHint.slice(0, 50))}${hHint.length > 50 ? "…" : ""}</button>` : ""}
    </div>
    <div class="field"><label>Email *</label><input id="rEmail" type="email" value="${esc(data.email)}" placeholder="you@company.com"></div>
    <div class="field"><label>Phone</label><input id="rPhone" type="tel" value="${esc(data.phone)}" placeholder="+91 …"></div>
    <div class="field"><label>Location</label><input id="rLoc" value="${esc(data.location)}" placeholder="Mumbai / Vapi / Chennai"></div>
    <div class="field"><label>LinkedIn / Portfolio URL</label><input id="rLink" value="${esc(data.linkedin)}" placeholder="https://linkedin.com/in/…"></div>
    <div class="field">
      <label>Professional summary</label>
      <textarea id="rSum" rows="4" maxlength="700" placeholder="${esc(sHint || "2–4 lines on your packaging strengths…")}">${esc(data.summary)}</textarea>
      ${sHint ? `<button type="button" class="link" id="useSummaryHint" style="font-size:12px;padding:4px 0">Insert suggested summary</button>` : ""}
    </div>
  `;
}

function renderExperienceStep() {
  const blocks = data.experience
    .map(
      (ex, i) => `
    <div class="exp-block" data-i="${i}">
      ${data.experience.length > 1 ? `<button type="button" class="rm" data-rm-exp="${i}" aria-label="Remove">×</button>` : ""}
      <div class="field"><label>Job title</label><input data-ex="title" data-i="${i}" value="${esc(ex.title)}" placeholder="e.g. Production Manager – Flexible Packaging"></div>
      <div class="field"><label>Company</label><input data-ex="company" data-i="${i}" value="${esc(ex.company)}" placeholder="Converter / Brand / Supplier name"></div>
      <div style="display:flex;gap:10px">
        <div class="field" style="flex:1"><label>Start</label><input data-ex="start" data-i="${i}" value="${esc(ex.start)}" placeholder="Jan 2020"></div>
        <div class="field" style="flex:1"><label>End</label><input data-ex="end" data-i="${i}" value="${esc(ex.end)}" placeholder="Present"></div>
      </div>
      <div class="field"><label>Key achievements (one per line)</label><textarea data-ex="bullets" data-i="${i}" rows="3" placeholder="Improved OEE from 62% to 78%&#10;Reduced film waste by 12%&#10;Led BRC certification audit">${esc(ex.bullets)}</textarea></div>
    </div>`
    )
    .join("");
  return `
    <h3 style="margin:0 0 12px;font-size:16px">Work experience</h3>
    <p style="color:var(--muted);font-size:13px;margin:0 0 12px">Newest role first. Use numbers: OEE, waste %, cost saved, lines commissioned.</p>
    ${blocks}
    <button type="button" class="btn sm ghost" id="addExp">+ Add another role</button>
  `;
}

function renderEducationStep() {
  const blocks = data.education
    .map(
      (ed, i) => `
    <div class="edu-block" data-i="${i}">
      ${data.education.length > 1 ? `<button type="button" class="rm" data-rm-edu="${i}" aria-label="Remove">×</button>` : ""}
      <div class="field"><label>School / University</label><input data-ed="school" data-i="${i}" value="${esc(ed.school)}" placeholder="e.g. Institute of Chemical Technology / IIT"></div>
      <div class="field"><label>Degree</label><input data-ed="degree" data-i="${i}" value="${esc(ed.degree)}" placeholder="B.Tech / Diploma in Printing & Packaging"></div>
      <div class="field"><label>Year</label><input data-ed="year" data-i="${i}" value="${esc(ed.year)}" placeholder="2018"></div>
      <div class="field"><label>Extra (GPA, honors)</label><input data-ed="detail" data-i="${i}" value="${esc(ed.detail)}" placeholder="Optional"></div>
    </div>`
    )
    .join("");
  return `
    <h3 style="margin:0 0 12px;font-size:16px">Education</h3>
    ${blocks}
    <button type="button" class="btn sm ghost" id="addEdu">+ Add education</button>
  `;
}

function renderSkillsStep() {
  const skillHint = SKILL_HINTS[data.template] || "";
  return `
    <h3 style="margin:0 0 12px;font-size:16px">Skills & certifications</h3>
    <p style="color:var(--muted);font-size:13px;margin:0 0 12px">Packaging-relevant skills help recruiters and network members find you.</p>
    <div class="field">
      <label>Skills (comma-separated)</label>
      <textarea id="rSkills" rows="4" placeholder="${esc(skillHint)}">${esc(data.skills)}</textarea>
      ${skillHint ? `<button type="button" class="link" id="useSkillHint" style="font-size:12px;padding:4px 0">Fill suggested packaging skills</button>` : ""}
    </div>
    <div class="field">
      <label>Certifications</label>
      <input id="rCerts" value="${esc(data.certifications)}" placeholder="${esc(CERT_HINTS)}">
      ${CERT_HINTS ? `<button type="button" class="link" id="useCertHint" style="font-size:12px;padding:4px 0">Use common packaging certifications</button>` : ""}
    </div>
  `;
}

function renderPreviewStep() {
  return `
    <h3 style="margin:0 0 8px;font-size:16px">Preview</h3>
    <p style="color:var(--muted);font-size:13px;margin:0 0 12px">Looks good? Print or Save as PDF. Go back anytime to edit.</p>
    <div id="resumePreview"><div class="rv ${templateCssClass(data.template)}" id="resumePrintArea">${buildResumeHtml()}</div></div>
  `;
}

/** Map packaging template ids to existing CSS layout classes */
function templateCssClass(id) {
  return (
    {
      packops: "classic",
      salesnet: "modern",
      techpack: "executive",
      leader: "sidebar",
    }[id] || "classic"
  );
}

function collectCurrentStep() {
  if (step === 1) {
    data.fullName = $("#rName")?.value.trim() || "";
    data.headline = $("#rHeadline")?.value.trim() || "";
    data.email = $("#rEmail")?.value.trim() || "";
    data.phone = $("#rPhone")?.value.trim() || "";
    data.location = $("#rLoc")?.value.trim() || "";
    data.linkedin = $("#rLink")?.value.trim() || "";
    data.summary = $("#rSum")?.value.trim() || "";
  } else if (step === 2) {
    $$("[data-ex]").forEach((el) => {
      const i = +el.dataset.i;
      const k = el.dataset.ex;
      if (data.experience[i]) data.experience[i][k] = el.value;
    });
  } else if (step === 3) {
    $$("[data-ed]").forEach((el) => {
      const i = +el.dataset.i;
      const k = el.dataset.ed;
      if (data.education[i]) data.education[i][k] = el.value;
    });
  } else if (step === 4) {
    data.skills = $("#rSkills")?.value.trim() || "";
    data.certifications = $("#rCerts")?.value.trim() || "";
  }
}

function validateStep() {
  if (step === 0 && !data.template) {
    toast("Choose a template");
    return false;
  }
  if (step === 1) {
    if (!data.fullName) {
      toast("Enter your full name");
      return false;
    }
    if (!data.headline) {
      toast("Enter a professional headline");
      return false;
    }
    if (!data.email) {
      toast("Enter your email");
      return false;
    }
  }
  return true;
}

function bindStepEvents() {
  $$(".tpl-card").forEach((btn) => {
    btn.onclick = () => {
      data.template = btn.dataset.tpl;
      // Offer industry defaults when switching template if fields empty
      if (!data.headline && HEADLINE_HINTS[data.template]) data.headline = "";
      render();
    };
  });

  $("#useHeadlineHint")?.addEventListener("click", () => {
    const h = HEADLINE_HINTS[data.template];
    if (h && $("#rHeadline")) $("#rHeadline").value = h;
  });
  $("#useSummaryHint")?.addEventListener("click", () => {
    const s = SUMMARY_HINTS[data.template];
    if (s && $("#rSum")) $("#rSum").value = s;
  });
  $("#useSkillHint")?.addEventListener("click", () => {
    const s = SKILL_HINTS[data.template];
    if (s && $("#rSkills")) $("#rSkills").value = s;
  });
  $("#useCertHint")?.addEventListener("click", () => {
    if (CERT_HINTS && $("#rCerts")) $("#rCerts").value = CERT_HINTS;
  });

  $("#addExp")?.addEventListener("click", () => {
    collectCurrentStep();
    data.experience.push({ company: "", title: "", start: "", end: "", bullets: "" });
    render();
  });
  $$("[data-rm-exp]").forEach((b) => {
    b.onclick = () => {
      collectCurrentStep();
      data.experience.splice(+b.dataset.rmExp, 1);
      if (!data.experience.length) data.experience.push({ company: "", title: "", start: "", end: "", bullets: "" });
      render();
    };
  });

  $("#addEdu")?.addEventListener("click", () => {
    collectCurrentStep();
    data.education.push({ school: "", degree: "", year: "", detail: "" });
    render();
  });
  $$("[data-rm-edu]").forEach((b) => {
    b.onclick = () => {
      collectCurrentStep();
      data.education.splice(+b.dataset.rmEdu, 1);
      if (!data.education.length) data.education.push({ school: "", degree: "", year: "", detail: "" });
      render();
    };
  });

  $("#resBack")?.addEventListener("click", () => {
    collectCurrentStep();
    step = Math.max(0, step - 1);
    render();
  });

  $("#resNext")?.addEventListener("click", () => {
    collectCurrentStep();
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      step++;
      render();
      $("#resumeRoot")?.closest(".scroll")?.scrollTo?.({ top: 0 });
    } else {
      downloadResume();
    }
  });
}

function bulletsToList(text) {
  return (text || "")
    .split(/\n/)
    .map((l) => l.replace(/^[\s•\-\*]+/, "").trim())
    .filter(Boolean);
}

function buildResumeHtml() {
  const d = data;
  const cssClass = templateCssClass(d.template);
  const contact = [d.email, d.phone, d.location, d.linkedin].filter(Boolean).join(" · ");
  const skills = (d.skills || "")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const certs = (d.certifications || "")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const expHtml = d.experience
    .filter((ex) => ex.title || ex.company)
    .map((ex) => {
      const bullets = bulletsToList(ex.bullets);
      return `<div class="rv-item">
        <div class="h">${esc(ex.title)}${ex.company ? " — " + esc(ex.company) : ""}</div>
        <div class="sub">${esc([ex.start, ex.end].filter(Boolean).join(" – "))}</div>
        ${bullets.length ? `<ul class="bul">${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    })
    .join("");

  const eduHtml = d.education
    .filter((ed) => ed.school || ed.degree)
    .map(
      (ed) => `<div class="rv-item">
      <div class="h">${esc(ed.degree)}${ed.school ? " — " + esc(ed.school) : ""}</div>
      <div class="sub">${esc([ed.year, ed.detail].filter(Boolean).join(" · "))}</div>
    </div>`
    )
    .join("");

  const skillsHtml = skills.length
    ? `<div class="rv-skills">${skills.map((s) => `<span>${esc(s)}</span>`).join("<span>·</span>")}</div>`
    : "";
  const certsHtml = certs.length
    ? `<div class="rv-skills">${certs.map((s) => `<span>${esc(s)}</span>`).join("<span>·</span>")}</div>`
    : "";

  if (cssClass === "sidebar") {
    return `
      <div class="side">
        <div class="rv-name">${esc(d.fullName || "Your Name")}</div>
        <div class="rv-title">${esc(d.headline)}</div>
        <div class="rv-contact">${esc(contact)}</div>
        ${d.summary ? `<div class="rv-section"><h4>Profile</h4><div style="font-size:11.5px">${esc(d.summary)}</div></div>` : ""}
        ${skillsHtml ? `<div class="rv-section"><h4>Skills</h4>${skillsHtml}</div>` : ""}
        ${certsHtml ? `<div class="rv-section"><h4>Certifications</h4>${certsHtml}</div>` : ""}
      </div>
      <div class="main">
        ${expHtml ? `<div class="rv-section"><h4>Experience</h4>${expHtml}</div>` : ""}
        ${eduHtml ? `<div class="rv-section"><h4>Education</h4>${eduHtml}</div>` : ""}
      </div>`;
  }

  return `
    <div class="rv-name">${esc(d.fullName || "Your Name")}</div>
    <div class="rv-title">${esc(d.headline)}</div>
    <div class="rv-contact">${esc(contact)}</div>
    ${d.summary ? `<div class="rv-section"><h4>Summary</h4><div>${esc(d.summary)}</div></div>` : ""}
    ${expHtml ? `<div class="rv-section"><h4>Experience</h4>${expHtml}</div>` : ""}
    ${eduHtml ? `<div class="rv-section"><h4>Education</h4>${eduHtml}</div>` : ""}
    ${skillsHtml ? `<div class="rv-section"><h4>Skills</h4>${skillsHtml}</div>` : ""}
    ${certsHtml ? `<div class="rv-section"><h4>Certifications</h4>${certsHtml}</div>` : ""}
  `;
}

function downloadResume() {
  const html = buildResumeHtml();
  const tpl = templateCssClass(data.template);
  const name = (data.fullName || "Resume").replace(/[^\w\s-]/g, "").trim() || "Resume";

  const w = window.open("", "_blank");
  if (!w) {
    toast("Allow pop-ups to download your resume");
    return;
  }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(name)} – Packaging Resume</title>
<style>
  @page { margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 12.5px; line-height: 1.45; color: #111; }
  .rv { padding: 0; }
  .rv-name { font-size: 24px; font-weight: 700; margin: 0 0 2px; }
  .rv-title { font-size: 13px; color: #444; margin: 0 0 6px; }
  .rv-contact { font-size: 11px; color: #555; margin-bottom: 12px; }
  .rv-section { margin-top: 12px; }
  .rv-section h4 { margin: 0 0 5px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #222; padding-bottom: 2px; }
  .rv-item { margin-bottom: 7px; }
  .rv-item .h { font-weight: 700; }
  .rv-item .sub { font-size: 11px; color: #555; }
  .rv-item .bul { margin: 2px 0 0 14px; padding: 0; }
  .rv-item .bul li { margin: 1px 0; }
  .rv-skills { display: flex; flex-wrap: wrap; gap: 2px 8px; }
  .classic .rv-name { color: #0e3b2e; }
  .classic .rv-section h4 { color: #0e3b2e; border-color: #0e3b2e; }
  .modern { font-family: "Segoe UI", system-ui, sans-serif; }
  .modern .rv-name { font-size: 26px; letter-spacing: -0.3px; }
  .modern .rv-section h4 { border: 0; background: #0e3b2e; color: #fff; padding: 3px 7px; border-radius: 2px; display: inline-block; }
  .executive { border-top: 4px solid #1a1a2e; padding-top: 10px; }
  .executive .rv-section h4 { border-color: #1a1a2e; color: #1a1a2e; }
  .sidebar { display: grid; grid-template-columns: 32% 1fr; min-height: 90vh; }
  .sidebar .side { background: #0e3b2e; color: #e8f0ec; padding: 22px 16px; }
  .sidebar .side .rv-name { color: #fff; font-size: 18px; }
  .sidebar .side .rv-title { color: #b9d3c8; }
  .sidebar .side .rv-contact { color: #c5d9cf; font-size: 10.5px; }
  .sidebar .side h4 { color: #f2a900; border-color: #f2a900; font-size: 10px; }
  .sidebar .main { padding: 22px 18px; }
  .sidebar .main .rv-section h4 { color: #0e3b2e; border-color: #0e3b2e; }
  .toolbar { position: fixed; top: 0; left: 0; right: 0; background: #0e3b2e; color: #fff; padding: 10px 16px; display: flex; gap: 10px; align-items: center; z-index: 9; font-family: system-ui,sans-serif; }
  .toolbar button { background: #f2a900; color: #2a1d00; border: 0; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .toolbar span { flex: 1; font-size: 14px; }
  @media print { .toolbar { display: none !important; } body { margin: 0; } }
</style></head><body>
<div class="toolbar"><span>${esc(name)} – Packaging Resume</span><button onclick="window.print()">Print / Save as PDF</button></div>
<div style="padding-top:56px">
<div class="rv ${tpl}">${html}</div>
</div>
</body></html>`);
  w.document.close();
  toast("Resume opened — use Print → Save as PDF");
}
