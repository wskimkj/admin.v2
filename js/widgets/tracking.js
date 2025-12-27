export function initTrackingWidget(){
  const trackingWidgetBtn = document.getElementById("trackingWidgetBtn");
  const trackingWidget = document.getElementById("trackingWidget");
  const trackingClose = document.getElementById("trackingClose");
  const trackingCarrierRow = document.getElementById("trackingCarrierRow");
  const trackingInput = document.getElementById("trackingInput");
  const trackingGo = document.getElementById("trackingGo");
  const trackingError = document.getElementById("trackingError");
  const trackingResultHeader = document.getElementById("trackingResultHeader");
  const trackingFrame = document.getElementById("trackingFrame");

  function hideTracking(){ trackingWidget.classList.remove("visible"); }

  function normalizeWaybill(raw){ return String(raw || "").replace(/\D/g, ""); }
  function validateTracking(raw){
    const digits = normalizeWaybill(raw);
    if(!digits) return "운송장 번호를 입력해주세요.";
    if(digits.length < 8 || digits.length > 15) return "운송장 번호는 숫자 8~15자리로 입력해주세요.";
    return "";
  }
  function getActiveCarrier(){
    return trackingCarrierRow.querySelector(".tracking-carrier-pill.active");
  }

  function track(){
    trackingError.style.display = "none";

    const raw = trackingInput.value;
    const digits = normalizeWaybill(raw);
    const msg = validateTracking(raw);

    if(msg){
      trackingError.textContent = msg;
      trackingError.style.display = "block";
      trackingResultHeader.textContent = "입력값을 다시 확인해주세요.";
      trackingFrame.src = "";
      return;
    }

    trackingInput.value = digits;

    const carrierBtn = getActiveCarrier();
    const fullName = carrierBtn?.dataset?.full || "택배사";
    const baseUrl = carrierBtn?.dataset?.url || "";

    trackingResultHeader.innerHTML = `<span class="em">${fullName}</span> 배송 조회 화면입니다.`;
    trackingFrame.src = baseUrl + encodeURIComponent(digits);
  }

  function toggleTracking(){
    const v = trackingWidget.classList.contains("visible");
    if(v) hideTracking();
    else{
      trackingWidget.classList.add("visible");
      trackingInput.focus();
    }
  }

  trackingWidgetBtn.addEventListener("click",(e)=>{ toggleTracking(); e.stopPropagation(); });
  trackingClose.addEventListener("click",(e)=>{ hideTracking(); e.stopPropagation(); });
  trackingWidget.addEventListener("click",(e)=> e.stopPropagation());
  trackingWidget.addEventListener("mouseleave", ()=> hideTracking());

  trackingCarrierRow.addEventListener("click",(e)=>{
    const btn = e.target.closest(".tracking-carrier-pill");
    if(!btn) return;
    trackingCarrierRow.querySelectorAll(".tracking-carrier-pill").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    e.stopPropagation();
  });

  trackingGo.addEventListener("click",(e)=>{ track(); e.stopPropagation(); });
  trackingInput.addEventListener("keydown",(e)=>{ if(e.key === "Enter") track(); });

  return { hideTracking, toggleTracking };
}
