import { LAST_FRAME_KEY } from "../config/constants.js";

export function rememberFrame(url){
  localStorage.setItem(LAST_FRAME_KEY, url);
}
export function restoreLastFrame(defaultUrl){
  const last = localStorage.getItem(LAST_FRAME_KEY);
  return last ? last : defaultUrl;
}
