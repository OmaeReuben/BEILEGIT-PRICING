import { useState } from "react";

const tables = [
  {
    name: "users",
    color: "#1F4E79",
    light: "#DBEAFE",
    x: 50,
    y: 200,
    pk: "user_id",
    fields: [
      { name: "user_id", type: "INT", pk: true },
      { name: "username", type: "VARCHAR(50)" },
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "role", type: "ENUM('admin','teacher')" },
      { name: "email", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "classes",
    color: "#065F46",
    light: "#D1FAE5",
    x: 400,
    y: 50,
    pk: "class_id",
    fields: [
      { name: "class_id", type: "INT", pk: true },
      { name: "class_name", type: "VARCHAR(50)" },
      { name: "teacher_id", type: "INT", fk: true },
    ],
  },
  {
    name: "students",
    color: "#7C3AED",
    light: "#EDE9FE",
    x: 400,
    y: 320,
    pk: "student_id",
    fields: [
      { name: "student_id", type: "INT", pk: true },
      { name: "name", type: "VARCHAR(100)" },
      { name: "reg_number", type: "VARCHAR(30)" },
      { name: "class_id", type: "INT", fk: true },
    ],
  },
  {
    name: "attendance",
    color: "#B45309",
    light: "#FEF3C7",
    x: 730,
    y: 200,
    pk: "attendance_id",
    fields: [
      { name: "attendance_id", type: "INT", pk: true },
      { name: "student_id", type: "INT", fk: true },
      { name: "class_id", type: "INT", fk: true },
      { name: "date", type: "DATE" },
      { name: "status", type: "ENUM('P','A','L')" },
    ],
  },
  {
    name: "reports",
    color: "#9D174D",
    light: "#FCE7F3",
    x: 730,
    y: 430,
    pk: "report_id",
    fields: [
      { name: "report_id", type: "INT", pk: true },
      { name: "class_id", type: "INT", fk: true },
      { name: "generated_by", type: "INT", fk: true },
      { name: "date_range", type: "VARCHAR(50)" },
      { name: "summary", type: "TEXT" },
    ],
  },
];

const TABLE_W = 220;
const ROW_H = 28;
const HEADER_H = 36;

function tableHeight(t) {
  return HEADER_H + t.fields.length * ROW_H;
}

function fieldY(tableY, fieldIndex) {
  return tableY + HEADER_H + fieldIndex * ROW_H + ROW_H / 2;
}

function tableCenterX(t, right = false) {
  return right ? t.x + TABLE_W : t.x;
}

const relationships = [
  // users → classes (teacher_id)
  {
    from: "users", fromField: null, fromSide: "right",
    to: "classes", toField: "teacher_id", toSide: "left",
    label: "1 manages N", labelOffset: { x: 0, y: -14 }
  },
  // classes → students (class_id)
  {
    from: "classes", fromField: null, fromSide: "bottom",
    to: "students", toField: "class_id", toSide: "top",
    label: "1 has N", labelOffset: { x: 10, y: 0 }
  },
  // students → attendance (student_id)
  {
    from: "students", fromField: null, fromSide: "right",
    to: "attendance", toField: "student_id", toSide: "left",
    label: "1 has N", labelOffset: { x: 0, y: -14 }
  },
  // classes → attendance (class_id)
  {
    from: "classes", fromField: null, fromSide: "right",
    to: "attendance", toField: "class_id", toSide: "left",
    label: "", labelOffset: { x: 0, y: 14 }
  },
  // classes → reports (class_id)
  {
    from: "classes", fromField: null, fromSide: "bottom",
    to: "reports", toField: "class_id", toSide: "top",
    label: "1 generates N", labelOffset: { x: 60, y: 0 }
  },
  // users → reports (generated_by)
  {
    from: "users", fromField: null, fromSide: "bottom",
    to: "reports", toField: "generated_by", toSide: "left",
    label: "", labelOffset: { x: 0, y: 0 }
  },
];

function getConnectorPoints(rel, tableMap) {
  const from = tableMap[rel.from];
  const to = tableMap[rel.to];
  const toFieldIdx = to.fields.findIndex(f => f.name === rel.toField);

  let x1, y1, x2, y2;

  // from side
  if (rel.fromSide === "right") {
    x1 = from.x + TABLE_W;
    y1 = from.y + HEADER_H / 2 + 4;
  } else if (rel.fromSide === "bottom") {
    x1 = from.x + TABLE_W / 2;
    y1 = from.y + tableHeight(from);
  } else {
    x1 = from.x;
    y1 = from.y + HEADER_H / 2 + 4;
  }

  // to side
  if (rel.toSide === "left") {
    x2 = to.x;
    y2 = toFieldIdx >= 0 ? fieldY(to.y, toFieldIdx) : to.y + HEADER_H / 2 + 4;
  } else if (rel.toSide === "top") {
    x2 = to.x + TABLE_W / 2;
    y2 = to.y;
  } else {
    x2 = to.x + TABLE_W;
    y2 = toFieldIdx >= 0 ? fieldY(to.y, toFieldIdx) : to.y + HEADER_H / 2 + 4;
  }

  return { x1, y1, x2, y2 };
}

function CurvedLine({ x1, y1, x2, y2, color }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.5;
  const cy1 = y1;
  const cx2 = x1 + dx * 0.5;
  const cy2 = y2;
  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  return (
    <path d={d} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,3" markerEnd={`url(#arrow-${color.replace('#','')})`} opacity="0.8" />
  );
}

export default function ERDiagram() {
  const [hovered, setHovered] = useState(null);
  const tableMap = {};
  tables.forEach(t => { tableMap[t.name] = t; });

  const SVG_W = 1000;
  const SVG_H = 620;

  const arrowColors = [...new Set(tables.map(t => t.color))];

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#1E293B", marginBottom: 4, fontSize: 22 }}>
          Entity-Relationship Diagram
        </h2>
        <p style={{ textAlign: "center", color: "#64748B", marginBottom: 20, fontSize: 13 }}>
          Sana Shamba Attendance Management System
        </p>

        {/* Legend */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "PK — Primary Key", color: "#1F4E79" },
            { label: "FK — Foreign Key", color: "#7C3AED" },
            { label: "Field", color: "#374151" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
            <svg width="30" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,2" /><polygon points="24,2 30,5 24,8" fill="#94A3B8" /></svg>
            Relationship
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <svg width={SVG_W} height={SVG_H} style={{ display: "block", margin: "0 auto" }}>
            <defs>
              {arrowColors.map(c => (
                <marker key={c} id={`arrow-${c.replace('#','')}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c} opacity="0.7" />
                </marker>
              ))}
              <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" opacity="0.7" />
              </marker>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Relationships */}
            {relationships.map((rel, i) => {
              const { x1, y1, x2, y2 } = getConnectorPoints(rel, tableMap);
              const midX = (x1 + x2) / 2 + (rel.labelOffset?.x || 0);
              const midY = (y1 + y2) / 2 + (rel.labelOffset?.y || 0);
              const color = tableMap[rel.from].color;
              return (
                <g key={i}>
                  <CurvedLine x1={x1} y1={y1} x2={x2} y2={y2} color={color} />
                  {rel.label && (
                    <text x={midX} y={midY} textAnchor="middle" fontSize="10" fill={color} fontWeight="600"
                      style={{ userSelect: "none" }}>
                      {rel.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Tables */}
            {tables.map(table => {
              const h = tableHeight(table);
              const isHovered = hovered === table.name;
              return (
                <g key={table.name}
                  onMouseEnter={() => setHovered(table.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}>
                  {/* Shadow rect */}
                  <rect x={table.x + 3} y={table.y + 3} width={TABLE_W} height={h} rx="8" fill="#00000022" />
                  {/* Table body */}
                  <rect x={table.x} y={table.y} width={TABLE_W} height={h} rx="8"
                    fill="white" stroke={isHovered ? table.color : "#E2E8F0"} strokeWidth={isHovered ? 2 : 1}
                    filter="url(#shadow)" />
                  {/* Header */}
                  <rect x={table.x} y={table.y} width={TABLE_W} height={HEADER_H} rx="8" fill={table.color} />
                  <rect x={table.x} y={table.y + HEADER_H - 8} width={TABLE_W} height={8} fill={table.color} />
                  <text x={table.x + TABLE_W / 2} y={table.y + HEADER_H / 2 + 5}
                    textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">
                    {table.name}
                  </text>

                  {/* Fields */}
                  {table.fields.map((field, fi) => {
                    const fy = table.y + HEADER_H + fi * ROW_H;
                    const isEven = fi % 2 === 0;
                    return (
                      <g key={field.name}>
                        <rect x={table.x} y={fy} width={TABLE_W} height={ROW_H}
                          fill={isEven ? "#F8FAFC" : "white"}
                          rx={fi === table.fields.length - 1 ? 0 : 0} />
                        {/* Bottom border */}
                        {fi < table.fields.length - 1 && (
                          <line x1={table.x} y1={fy + ROW_H} x2={table.x + TABLE_W} y2={fy + ROW_H} stroke="#E2E8F0" strokeWidth="0.5" />
                        )}
                        {/* PK/FK badge */}
                        {field.pk && (
                          <rect x={table.x + 6} y={fy + 7} width={22} height={14} rx="3" fill={table.color} opacity="0.15" />
                        )}
                        {field.pk && (
                          <text x={table.x + 17} y={fy + 18} textAnchor="middle" fontSize="8" fill={table.color} fontWeight="bold">PK</text>
                        )}
                        {field.fk && (
                          <rect x={table.x + 6} y={fy + 7} width={22} height={14} rx="3" fill="#7C3AED" opacity="0.12" />
                        )}
                        {field.fk && (
                          <text x={table.x + 17} y={fy + 18} textAnchor="middle" fontSize="8" fill="#7C3AED" fontWeight="bold">FK</text>
                        )}
                        <text x={table.x + 34} y={fy + 18} fontSize="11" fill={field.pk ? table.color : field.fk ? "#7C3AED" : "#374151"}
                          fontWeight={field.pk || field.fk ? "600" : "400"} fontFamily="Arial">
                          {field.name}
                        </text>
                        <text x={table.x + TABLE_W - 6} y={fy + 18} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Arial" fontStyle="italic">
                          {field.type}
                        </text>
                      </g>
                    );
                  })}
                  {/* Bottom corners rounding */}
                  <rect x={table.x} y={table.y + h - 8} width={TABLE_W} height={8} rx="0" fill={isEven => "#F8FAFC"} />
                  <rect x={table.x} y={table.y + h - 8} width={TABLE_W} height={8}
                    fill={table.fields.length % 2 === 0 ? "white" : "#F8FAFC"} />
                  <rect x={table.x} y={table.y + h - 8} width={TABLE_W} height={8} rx="0" fill="none"
                    stroke={isHovered ? table.color : "#E2E8F0"} strokeWidth={isHovered ? 2 : 1} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Relationships summary */}
        <div style={{ marginTop: 20, padding: "16px 20px", background: "white", borderRadius: 10, border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: 13, color: "#374151", margin: "0 0 10px 0" }}>Relationships Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
            {[
              { rel: "users → classes", desc: "One teacher manages many classes (teacher_id)" },
              { rel: "classes → students", desc: "One class has many students (class_id)" },
              { rel: "students → attendance", desc: "One student has many attendance records" },
              { rel: "classes → attendance", desc: "One class has many attendance records" },
              { rel: "classes → reports", desc: "One class can have many reports" },
              { rel: "users → reports", desc: "One admin/teacher generates many reports" },
            ].map(r => (
              <div key={r.rel} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#6366F1", fontWeight: "bold", fontSize: 12, minWidth: 6 }}>→</span>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "600", color: "#1E293B" }}>{r.rel}:</span>
                  <span style={{ fontSize: 12, color: "#64748B" }}> {r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
