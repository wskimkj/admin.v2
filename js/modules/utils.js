export function pad2(n){ return String(n).padStart(2, "0"); }

export function dateKeyLocal(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

export function normalizeToKey(value){
  if(!value) return null;
  let s = String(value).trim();
  s = s.replace(/\([^)]+\)/g, "");
  s = s.replace(/\s+/g, "");

  const ymd = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if(ymd){
    return `${ymd[1]}-${String(ymd[2]).padStart(2,"0")}-${String(ymd[3]).padStart(2,"0")}`;
  }
  const md = s.match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
  if(md){
    const year = new Date().getFullYear();
    return `${year}-${pad2(Number(md[1]))}-${pad2(Number(md[2]))}`;
  }
  const d = new Date(s);
  if(!isNaN(d)) return dateKeyLocal(d);
  return null;
}

export function inRangeKey(dayKey, startKey, endKey){
  return dayKey >= startKey && dayKey <= endKey;
}

export const KOR_DOW = ["일","월","화","수","목","금","토"];
export function formatMDKorean(dateKey){
  const [y,m,d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  return `${pad2(m)}/${pad2(d)}(${KOR_DOW[dt.getDay()]})`;
}

export function formatBulletLines(text){
  const s = String(text ?? "");
  return s.replace(/\s*■\s*/g, "\n■ ").replace(/\n{3,}/g, "\n\n").trim();
}

export function escapeHtml(str){
  return String(str ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

export function textToHtmlWithBreaks(text){
  const safe = escapeHtml(String(text ?? ""));
  return safe.replace(/\r\n|\r|\n/g, "<br>");
}

export function cleanTarget(raw){
  let t = String(raw ?? "").trim();
  t = t.replace(/^"+|"+$/g, "").trim();
  if(t === '""') t = "";
  return t;
}

export function parseCsvGeneric(text){
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  if(text && text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === ",") { row.push(cur); cur = ""; continue; }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      if (row.some(c => (c || "").toString().trim() !== "")) rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    if (row.some(c => (c || "").toString().trim() !== "")) rows.push(row);
  }
  return rows;
}

export function splitAgKeywords(v){
  return (v || "").toString().split(",").map(s=>s.trim()).filter(Boolean);
}
export function splitQueryKeywords(q){
  return (q || "").toString().split(/[,\s]+/g).map(s=>s.trim()).filter(Boolean);
}
export function normalize(s){ return (s || "").toString().toLowerCase().trim(); }

export function tokenMatchAny(agTokens, queryTokens){
  const a = (agTokens || []).map(normalize).filter(Boolean);
  const q = (queryTokens || []).map(normalize).filter(Boolean);
  if(!a.length || !q.length) return false;
  return q.some(qt => a.some(at => at.includes(qt)));
}
export function tokenMatchAll(agTokens, queryTokens){
  const a = (agTokens || []).map(normalize).filter(Boolean);
  const q = (queryTokens || []).map(normalize).filter(Boolean);
  if(!a.length || !q.length) return false;
  return q.every(qt => a.some(at => at.includes(qt)));
}

export function textMatchAny(text, queryTokens){
  const t = normalize(text);
  const q = (queryTokens || []).map(normalize).filter(Boolean);
  if(!t || !q.length) return false;
  return q.some(qt => t.includes(qt));
}
export function textMatchAll(text, queryTokens){
  const t = normalize(text);
  const q = (queryTokens || []).map(normalize).filter(Boolean);
  if(!t || !q.length) return false;
  return q.every(qt => t.includes(qt));
}
