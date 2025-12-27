import { showSubSidebar } from "../modules/ui.js";
import { rememberFrame } from "../modules/storage.js";

export function initSidebars({ closeAllPanels, toggleCalendar }){
  const mainFrame = document.getElementById("mainFrame");

  const subSidebar = document.getElementById("subSidebar");
  const googleBtn = document.getElementById("googleBtn");
  const googleChildren = document.querySelectorAll(".google-child");

  const utilSidebar = document.getElementById("utilSidebar");
  const utilBtn = document.getElementById("utilBtn");
  const utilChildren = document.querySelectorAll(".util-child");

  // google etc accordion
  const googleEtcHead = document.getElementById("googleEtcHead");
  const googleEtcBody = document.getElementById("googleEtcBody");

  function hideAllSubSidebars(){
    subSidebar.classList.remove("visible");
    utilSidebar.classList.remove("visible");
  }

  googleBtn.addEventListener("click",(e)=>{
    const isOpen = subSidebar.classList.contains("visible");
    if(typeof closeAllPanels === "function") closeAllPanels();
    if(!isOpen) showSubSidebar(subSidebar, googleBtn);
    e.stopPropagation();
  });

  utilBtn.addEventListener("click",(e)=>{
    const isOpen = utilSidebar.classList.contains("visible");
    if(typeof closeAllPanels === "function") closeAllPanels();
    if(!isOpen) showSubSidebar(utilSidebar, utilBtn);
    e.stopPropagation();
  });

  googleChildren.forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      googleChildren.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      const url = btn.dataset.href;
      if(url){
        mainFrame.src = url;
        rememberFrame(url);
      }
      if(typeof closeAllPanels === "function") closeAllPanels();
      e.stopPropagation();
    });
  });

  utilChildren.forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      utilChildren.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      const action = btn.dataset.action;
      const url = btn.dataset.href;

      if(action === "event"){
        if(typeof toggleCalendar === "function") toggleCalendar();
      }else if(url){
        mainFrame.src = url;
        rememberFrame(url);
        if(typeof closeAllPanels === "function") closeAllPanels();
      }
      e.stopPropagation();
    });
  });

  // Accordion toggle (기타)
  if(googleEtcHead && googleEtcBody){
    googleEtcHead.addEventListener("click", (e)=>{
      e.stopPropagation();
      const expanded = googleEtcHead.getAttribute("aria-expanded") === "true";
      googleEtcHead.setAttribute("aria-expanded", String(!expanded));
      googleEtcBody.hidden = expanded ? true : false;
    });
  }

  // Outside click: close only sub sidebars (same idea as original)
  document.addEventListener("click", (e)=>{
    const t = e.target;
    const clickedGoogle = googleBtn.contains(t) || subSidebar.contains(t);
    const clickedUtil   = utilBtn.contains(t) || utilSidebar.contains(t);

    const calendarWidget = document.getElementById("calendarWidget");
    const adminEventBtn = document.getElementById("adminEventBtn");
    const phoneWidget = document.getElementById("phoneWidget");
    const phoneFormatBtn = document.getElementById("phoneFormatBtn");
    const trackingWidget = document.getElementById("trackingWidget");
    const trackingWidgetBtn = document.getElementById("trackingWidgetBtn");
    const accountWidget = document.getElementById("accountWidget");
    const accountWidgetBtn = document.getElementById("accountWidgetBtn");

    const clickedInsideCalendar = calendarWidget.contains(t) || adminEventBtn.contains(t);
    const clickedInsidePhone = phoneWidget.contains(t) || phoneFormatBtn.contains(t);
    const clickedInsideTracking = trackingWidget.contains(t) || trackingWidgetBtn.contains(t);
    const clickedInsideAccount = accountWidget.contains(t) || accountWidgetBtn.contains(t);

    if(!clickedGoogle && !clickedUtil && !clickedInsideCalendar && !clickedInsidePhone && !clickedInsideTracking && !clickedInsideAccount){
      hideAllSubSidebars();
    }
  });

  return { hideAllSubSidebars };
}
