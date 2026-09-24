/**
 * Packaging-industry resume templates – loaded only when Resume tab opens.
 * FPJob / Packaging Industry Network
 */

export const TEMPLATES = [
  {
    id: "packops",
    name: "Packaging Ops",
    desc: "Plant · production · quality focus",
    industry: "Operations & Quality",
    mini: "<div style='font-weight:700;font-size:8px;color:#0e3b2e'>YOUR NAME</div><div>Packaging Manager</div><div style='margin-top:3px;border-top:1px solid #0e3b2e;font-size:6px'>EXPERIENCE</div><div style='font-size:6px'>Plant Lead · OEE ↑</div><div style='margin-top:2px;border-top:1px solid #0e3b2e;font-size:6px'>CERTIFICATIONS</div>",
  },
  {
    id: "salesnet",
    name: "Sales & Network",
    desc: "BD · key accounts · distributors",
    industry: "Sales & Business Development",
    mini: "<div style='font-weight:700;font-size:8px'>YOUR NAME</div><div style='font-size:6px'>Regional Sales Head</div><div style='margin-top:3px;background:#0e3b2e;color:#fff;display:inline;padding:1px 3px;font-size:5px'>ACHIEVEMENTS</div><div style='font-size:6px'>₹12 Cr territory</div><div style='margin-top:2px;background:#0e3b2e;color:#fff;display:inline;padding:1px 3px;font-size:5px'>SKILLS</div>",
  },
  {
    id: "techpack",
    name: "Tech & Design",
    desc: "R&D · structures · sustainability",
    industry: "Technical & R&D",
    mini: "<div style='border-top:3px solid #1a1a2e;padding-top:2px;font-weight:700;font-size:8px'>YOUR NAME</div><div style='font-size:6px'>Packaging Technologist</div><div style='margin-top:3px;border-bottom:1px solid #1a1a2e;font-weight:700;font-size:6px'>PROJECTS</div><div style='font-size:6px'>Mono-material pouch</div>",
  },
  {
    id: "leader",
    name: "Industry Leader",
    desc: "CXO · GM · multi-plant leadership",
    industry: "Leadership",
    mini: "<div style='display:flex;height:100%'><div style='width:34%;background:#0e3b2e;color:#fff;padding:3px;font-size:5px'><b>NAME</b><br>COO<br><br>P&L<br>ISO · Lean</div><div style='flex:1;padding:3px;font-size:5px'><b>EXPERIENCE</b><br>Group GM<br>Plant Head<br><br><b>EDUCATION</b></div></div>",
  },
];

/** Suggested headlines by template */
export const HEADLINE_HINTS = {
  packops: "Packaging Production Manager | Lean · OEE · Quality Systems",
  salesnet: "Regional Sales Manager – Flexible Packaging | Key Accounts",
  techpack: "Packaging Technologist | Sustainable Structures & Barrier Films",
  leader: "General Manager – Packaging Operations | Multi-plant P&L",
};

/** Suggested skills (packaging industry) by template */
export const SKILL_HINTS = {
  packops:
    "OEE improvement, Lean manufacturing, Six Sigma, ISO 9001, ISO 22000, HACCP, BRC Packaging, SAP PM, 5S, Kaizen, Film extrusion, Pouching, Cartoning, Quality control, GMP",
  salesnet:
    "Key account management, Distributor network, Channel sales, Negotiation, CRM, Flexible packaging, Rigid packaging, Corrugated, Shrink sleeves, Tendering, Market development, Forecasting",
  techpack:
    "Packaging design, Structural design, Barrier films, Mono-material, LCA, Sustainability, ASTM/ISO test methods, Shelf-life studies, CAD, ArtiosCAD, Material selection, Regulatory (FSSAI, FDA)",
  leader:
    "P&L ownership, Multi-plant operations, Strategic planning, Capex projects, Team leadership, Safety culture, Cost reduction, Vendor development, ERP (SAP), Board reporting, M&A integration",
};

/** Suggested summary starters */
export const SUMMARY_HINTS = {
  packops:
    "Packaging operations professional with hands-on experience in film conversion, pouching and quality systems. Proven track record improving OEE, reducing waste and implementing ISO/BRC standards on the shop floor.",
  salesnet:
    "Results-driven packaging sales leader with deep relationships across brand owners and converters in flexible and rigid packaging. Consistently exceeded territory targets through key-account focus and channel development.",
  techpack:
    "Packaging technologist specializing in sustainable structures, barrier performance and cost-optimized designs. Experienced from concept through validation for food, personal care and industrial applications.",
  leader:
    "Senior packaging industry leader with multi-plant P&L responsibility. Built high-performing teams, delivered cost and quality programs, and scaled operations across film, converting and corrugation businesses.",
};

/** Common packaging role titles for placeholders */
export const ROLE_PLACEHOLDERS = [
  "Production Manager – Flexible Packaging",
  "Quality Assurance Manager",
  "Packaging Development Engineer",
  "Regional Sales Manager",
  "Plant Head",
  "Maintenance Manager",
  "Purchase / Procurement Manager",
  "Printing / Lamination Supervisor",
];

/** Certifications often valued in packaging */
export const CERT_HINTS =
  "Six Sigma Green Belt, ISO 9001 Lead Auditor, BRC Packaging, HACCP, IOSH, SAP Certified";
