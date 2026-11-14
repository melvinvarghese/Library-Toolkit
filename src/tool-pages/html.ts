const entities:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};

/** Escapes text so it is safe to place inside HTML written with innerHTML. */
export const esc=(value:string)=>String(value).replace(/[&<>"']/g,char=>entities[char]||char);
