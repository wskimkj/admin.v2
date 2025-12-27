export function initPhoneWidget(){
  const phoneWidget = document.getElementById("phoneWidget");
  const phoneFormatBtn = document.getElementById("phoneFormatBtn");
  const phoneClose = document.getElementById("phoneClose");
  const phoneInput = document.getElementById("phoneInput");
  const phoneOutput = document.getElementById("phoneOutput");
  const phoneCopy = document.getElementById("phoneCopy");
  const phoneHint = document.getElementById("phoneHint");

  function hidePhone(){ phoneWidget.classList.remove("visible"); }

  function formatKoreanPhone(input){
    let num = String(input ?? "").replace(/\D/g, "");
    if(num.startsWith("82")) num = "0" + num.slice(2);

    const SAFE_PREFIX = ["0502","0504","0505","0506","0507"];
    for(const p of SAFE_PREFIX){
      if(num.startsWith(p)){
        if(num.length === 11){
          return { type:"safe", value: num.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3") };
        }
        if(num.length === 12){
          return { type:"safe", value: num.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3") };
        }
      }
    }

    if(num.length === 10 && num.startsWith("10")) num = "0" + num;
    if(num.length === 11 && num.startsWith("010")){
      return { type:"mobile", value: num.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") };
    }
    return { type:"unknown", value:"" };
  }

  async function copyText(v){
    if(!v) return;
    try{
      await navigator.clipboard.writeText(v);
      phoneHint.textContent = "복사됨 ✅";
    }catch{
      phoneHint.textContent = "복사 실패(브라우저 권한 확인)";
    }
  }

  function togglePhone(){
    const v = phoneWidget.classList.contains("visible");
    if(v) hidePhone();
    else{
      phoneWidget.classList.add("visible");
      phoneInput.focus();
    }
  }

  phoneFormatBtn.addEventListener("click",(e)=>{ togglePhone(); e.stopPropagation(); });
  phoneClose.addEventListener("click",(e)=>{ hidePhone(); e.stopPropagation(); });
  phoneWidget.addEventListener("click",(e)=> e.stopPropagation());
  phoneWidget.addEventListener("mouseleave", () => hidePhone());

  phoneInput.addEventListener("input", ()=>{
    const result = formatKoreanPhone(phoneInput.value);
    if(result.value){
      phoneOutput.textContent = result.value;
      phoneHint.textContent = (result.type === "safe") ? "안전번호 (가상번호)" : "휴대폰 번호";
    }else{
      phoneOutput.textContent = "";
      phoneHint.textContent = "번호를 입력하세요";
    }
  });

  phoneOutput.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); copyText(phoneOutput.textContent); });
  phoneCopy.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); copyText(phoneOutput.textContent); });

  return { hidePhone, togglePhone };
}
