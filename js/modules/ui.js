export function placeSubSidebarNear(btn, panel){
  const r = btn.getBoundingClientRect();
  const left = 96;

  const h = panel.offsetHeight || 220;
  let top = r.top + window.scrollY + (r.height/2) - (h/2);

  const minTop = 12 + window.scrollY;
  const maxTop = window.scrollY + window.innerHeight - h - 12;
  top = Math.max(minTop, Math.min(top, maxTop));

  panel.style.left = left + "px";
  panel.style.top  = top  + "px";
}

export function showSubSidebar(panel, anchorBtn){
  panel.classList.add("visible");
  requestAnimationFrame(()=> placeSubSidebarNear(anchorBtn, panel));
}
