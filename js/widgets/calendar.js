import { CAL_VIEW_KEY, EVENT_SHEET_URL, EVENT_SHEET_CSV_URL } from "../config/constants.js";
import {
  dateKeyLocal, inRangeKey, normalizeToKey,
  formatMDKorean, formatBulletLines, escapeHtml, textToHtmlWithBreaks,
  cleanTarget, parseCsvGeneric
} from "../modules/utils.js";

export function initCalendarWidget(){
  const calendarWidget = document.getElementById("calendarWidget");
  const adminEventBtn = document.getElementById("adminEventBtn");
  const calViewSeg = document.getElementById("calViewSeg");
  const todayIcon = document.getElementById("todayEventIcon");
  const todayBadge = document.getElementById("todayBadge");
  const popup = document.getElementById("datePopup");
  const popupClose = document.getElementById("popupClose");

  function hideCalendar(){ calendarWidget.classList.remove("visible"); }
  function closePopup(){ popup.classList.remove("open"); }

  let calendarViewMode = localStorage.getItem(CAL_VIEW_KEY) || "week";
  let events = [];

  function applyViewSeg(){
    [...calViewSeg.querySelectorAll("button")].forEach(b=>{
      b.classList.toggle("active", b.dataset.view === calendarViewMode);
    });
  }

  function toggleCalendar(){
    const v = calendarWidget.classList.contains("visible");
    if(v) { hideCalendar(); closePopup(); }
    else{
      calendarWidget.classList.add("visible");
      buildCalendar();
    }
  }

  adminEventBtn.addEventListener("click",(e)=>{ toggleCalendar(); e.stopPropagation(); });

  calViewSeg.addEventListener("click",(e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    calendarViewMode = btn.dataset.view;
    localStorage.setItem(CAL_VIEW_KEY, calendarViewMode);
    applyViewSeg();
    closePopup();
    buildCalendar();
    e.stopPropagation();
  });

  todayIcon.addEventListener("click",(e)=>{
    window.open(EVENT_SHEET_URL, "_blank");
    e.stopPropagation();
  });

  popupClose.addEventListener("click",(e)=>{ closePopup(); e.stopPropagation(); });

  async function loadEventsFromSheet(){
    try{
      const res = await fetch(EVENT_SHEET_CSV_URL, { cache:"no-store" });
      if(!res.ok) throw new Error(`sheet fetch failed (${res.status})`);
      const csv = await res.text();
      const rows = parseCsvGeneric(csv);

      const parsed = [];
      for(const r of rows){
        const mall    = (r[2] || "").trim(); // C
        const startV  = (r[3] || "").trim(); // D
        const endV    = (r[4] || "").trim(); // E
        const content = (r[5] || "").trim(); // F
        const target  = cleanTarget(r[6] || ""); // G

        if(!mall && !startV && !endV && !content && !target) continue;

        const startKey = normalizeToKey(startV);
        const endKey   = normalizeToKey(endV);
        if(!mall || !startKey || !endKey) continue;
        if(startKey > endKey) continue;

        parsed.push({ mall, start: startKey, end: endKey, content, target });
      }

      events = parsed;
      buildCalendar();
      updateTodayBadge();
    }catch(err){
      console.error(err);
      events = [];
      buildCalendar();
      updateTodayBadge();
    }
  }

  function updateTodayBadge(){
    const todayKey = dateKeyLocal(new Date());
    const count = events.filter(ev => inRangeKey(todayKey, ev.start, ev.end)).length;

    if(count > 0){
      todayIcon.classList.remove("dim");
      todayBadge.style.display = "inline-flex";
      todayBadge.textContent = String(count);
    }else{
      todayIcon.classList.add("dim");
      todayBadge.style.display = "none";
      todayBadge.textContent = "";
    }
  }

  function openPopupForDate(dateKey){
    const items = events.filter(ev => inRangeKey(dateKey, ev.start, ev.end));
    document.getElementById("popupDateLabel").textContent = formatMDKorean(dateKey);

    document.getElementById("popupEventList").innerHTML = items.length
      ? items.map(ev=>{
          const pretty = formatBulletLines(ev.content || "(내용없음)");
          const hasItem = !!(ev.target && ev.target.trim());
          return `
            <div class="mini-event">
              <div class="mall">${escapeHtml(ev.mall)}</div>
              <div class="event-text">${textToHtmlWithBreaks(pretty)}</div>

              ${hasItem ? `
                <div class="item-box" data-itembox>
                  <button type="button" class="item-head" data-itemtoggle aria-expanded="false">
                    <span class="item-label">ITEM</span>
                    <i class='bx bx-chevron-down item-caret'></i>
                  </button>
                  <div class="item-text is-collapsed" data-itemcontent>
                    ${escapeHtml(ev.target)}
                  </div>
                </div>
              ` : ``}

              <div class="meta">${escapeHtml(ev.start)} ~ ${escapeHtml(ev.end)}</div>
            </div>
          `;
        }).join("")
      : `<div style="font-size:11px;color:rgba(15,23,42,0.62);font-weight:800;padding:6px 2px;">이날 이벤트 없음</div>`;

    popup.classList.add("open");
  }

  function buildCalendar(){
    if(calendarViewMode === "month") buildCalendarMonth();
    else buildCalendarWeek();
  }

  function buildCalendarWeek(){
    const today = new Date();
    const todayKey = dateKeyLocal(today);

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("calendarMonthLabel").textContent = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    const dow = (today.getDay()+6)%7; // Mon=0
    const mon = new Date(today);
    mon.setDate(today.getDate() - dow);

    const days = [];
    for(let i=0;i<5;i++){
      const d = new Date(mon);
      d.setDate(mon.getDate()+i);
      days.push(d);
    }

    const daysContainer = document.getElementById("calendarDays");
    daysContainer.innerHTML = "";

    days.forEach(d=>{
      const key = dateKeyLocal(d);
      const count = events.filter(ev => inRangeKey(key, ev.start, ev.end)).length;

      const cell = document.createElement("div");
      cell.className = "calendar-day";
      cell.textContent = d.getDate();

      if(key === todayKey) cell.classList.add("today");
      if(count > 0){
        cell.classList.add("has-event");
        const badge = document.createElement("div");
        badge.className = "day-badge";
        badge.textContent = String(count);
        cell.appendChild(badge);
      }

      cell.addEventListener("click", (e)=>{
        openPopupForDate(key);
        e.stopPropagation();
      });

      daysContainer.appendChild(cell);
    });
  }

  function buildCalendarMonth(){
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const todayKey = dateKeyLocal(today);

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("calendarMonthLabel").textContent = `${monthNames[month]} ${year}`;

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth  = new Date(year, month + 1, 0);

    const daysContainer = document.getElementById("calendarDays");
    daysContainer.innerHTML = "";

    let start = new Date(firstOfMonth);
    const startDow = (start.getDay()+6)%7;
    start.setDate(start.getDate()-startDow);

    let end = new Date(lastOfMonth);
    const endDow = (end.getDay()+6)%7;
    end.setDate(end.getDate() + (4 - endDow)); // Fri

    let d = new Date(start);
    while(d <= end){
      const wd = d.getDay();
      if(wd >= 1 && wd <= 5){
        const key = dateKeyLocal(d);
        const count = events.filter(ev => inRangeKey(key, ev.start, ev.end)).length;

        const cell = document.createElement("div");
        cell.className = "calendar-day";
        if(d.getMonth() !== month) cell.classList.add("other-month");
        cell.textContent = d.getDate();

        if(key === todayKey) cell.classList.add("today");
        if(count > 0){
          cell.classList.add("has-event");
          const badge = document.createElement("div");
          badge.className = "day-badge";
          badge.textContent = String(count);
          cell.appendChild(badge);
        }

        if(d.getMonth() === month){
          cell.addEventListener("click", (e)=>{ openPopupForDate(key); e.stopPropagation(); });
        }else{
          cell.style.pointerEvents = "none";
        }

        daysContainer.appendChild(cell);
      }
      d.setDate(d.getDate()+1);
    }
  }

  calendarWidget.addEventListener("click", (e)=> e.stopPropagation());
  calendarWidget.addEventListener("mouseleave", () => { closePopup(); hideCalendar(); });

  // ITEM 토글
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-itemtoggle]");
    if(!btn) return;

    e.stopPropagation();
    const box = btn.closest("[data-itembox]");
    const content = box?.querySelector("[data-itemcontent]");
    if(!content) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    content.classList.toggle("is-collapsed", expanded ? true : false);
  });

  applyViewSeg();
  loadEventsFromSheet();
  buildCalendar();
  updateTodayBadge();

  return { hideCalendar, closePopup, toggleCalendar };
}
