"use strict";(()=>{var d=class{constructor(e){this.baseUrl=e.baseUrl,this.headers={"Content-Type":"application/json",...e.defaultHeaders},this.maxRetries=e.maxRetries??3,this.initialRetryDelay=e.initialRetryDelay??500}async resolveHeaders(){let e={};for(let[r,i]of Object.entries(this.headers)){let t=await i;t!==null&&(e[r]=t)}return e}addHeader(e,r){this.headers[e]=r}async post(e,r,i,t){try{let s=await fetch(e,{method:"POST",headers:await this.resolveHeaders(),body:JSON.stringify(r??{}),keepalive:!0,...i});if(s.status===401)return null;if(s.status!==200&&s.status!==202)throw new Error(`HTTP error! status: ${s.status}`);let n=await s.text();return n?JSON.parse(n):null}catch(s){if(t<this.maxRetries){let n=this.initialRetryDelay*Math.pow(2,t);return await new Promise(a=>setTimeout(a,n)),this.post(e,r,i,t+1)}return console.error("Max retries reached:",s),null}}async fetch(e,r,i={}){let t=`${this.baseUrl}${e}`;return this.post(t,r,i,0)}},h=class{constructor(e){this.options=e,this.queue=[];let r={"openpanel-client-id":e.clientId};e.clientSecret&&(r["openpanel-client-secret"]=e.clientSecret),r["openpanel-sdk"]=e.sdk||"node",r["openpanel-sdk-version"]=e.sdkVersion||"0.0.11-beta",this.api=new d({baseUrl:e.apiUrl||"https://api.openpanel.dev",defaultHeaders:r})}init(){}ready(){this.options.waitForProfile=!1,this.flush()}async send(e){return this.options.filter&&!this.options.filter(e)?Promise.resolve():this.options.waitForProfile&&!this.profileId?(this.queue.push(e),Promise.resolve()):this.api.fetch("/track",e)}setGlobalProperties(e){this.global={...this.global,...e}}async track(e,r){return this.send({type:"track",payload:{name:e,profileId:r?.profileId??this.profileId,properties:{...this.global??{},...r??{}}}})}async identify(e){if(e.profileId&&(this.profileId=e.profileId,this.flush()),Object.keys(e).length>1)return this.send({type:"identify",payload:{...e,properties:{...this.global,...e.properties}}})}async alias(e){return this.send({type:"alias",payload:e})}async increment(e){return this.send({type:"increment",payload:e})}async decrement(e){return this.send({type:"decrement",payload:e})}clear(){this.profileId=void 0}flush(){this.queue.forEach(e=>{this.send({...e,payload:{...e.payload,profileId:this.profileId}})}),this.queue=[]}};function u(e){return e.replace(/([-_][a-z])/gi,r=>r.toUpperCase().replace("-","").replace("_",""))}var c=class extends h{constructor(i){super({...i,sdk:"web",sdkVersion:"0.0.11-beta"});this.options=i;this.lastPath="";this.isServer()||(this.setGlobalProperties({__referrer:document.referrer}),this.options.trackScreenViews&&this.trackScreenViews(),this.options.trackOutgoingLinks&&this.trackOutgoingLinks(),this.options.trackAttributes&&this.trackAttributes())}debounce(i,t){clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(i,t)}isServer(){return typeof document>"u"}trackOutgoingLinks(){this.isServer()||document.addEventListener("click",i=>{let t=i.target,s=t.closest("a");if(s&&t){let n=s.getAttribute("href");n?.startsWith("http")&&super.track("link_out",{href:n,text:s.innerText||s.getAttribute("title")||t.getAttribute("alt")||t.getAttribute("title")})}})}trackScreenViews(){if(this.isServer())return;this.screenView();let i=history.pushState;history.pushState=function(...a){let o=i.apply(this,a);return window.dispatchEvent(new Event("pushstate")),window.dispatchEvent(new Event("locationchange")),o};let t=history.replaceState;history.replaceState=function(...a){let o=t.apply(this,a);return window.dispatchEvent(new Event("replacestate")),window.dispatchEvent(new Event("locationchange")),o},window.addEventListener("popstate",function(){window.dispatchEvent(new Event("locationchange"))});let s=()=>this.debounce(()=>this.screenView(),50);this.options.trackHashChanges?window.addEventListener("hashchange",s):window.addEventListener("locationchange",s)}trackAttributes(){this.isServer()||document.addEventListener("click",i=>{let t=i.target,s=t.closest("button"),n=t.closest("a"),a=s?.getAttribute("data-event")?s:n?.getAttribute("data-event")?n:null;if(a){let o={};for(let l of a.attributes)l.name.startsWith("data-")&&l.name!=="data-event"&&(o[u(l.name.replace(/^data-/,""))]=l.value);let p=a.getAttribute("data-event");p&&super.track(p,o)}})}screenView(i,t){if(this.isServer())return;let s,n;typeof i=="string"?(s=i,n=t):(s=window.location.href,n=i),this.lastPath!==s&&(this.lastPath=s,super.track("screen_view",{...n??{},__path:s,__title:document.title}))}};(e=>{if(e.op&&"q"in e.op){let r=e.op.q||[],i=new c(r.shift()[1]);r.forEach(t=>{t[0]in i&&i[t[0]](...t.slice(1))}),e.op=(t,...s)=>{let n=i[t]?i[t].bind(i):void 0;typeof n=="function"?n(...s):console.warn(`op.js: ${t} is not a function`)},e.openpanel=i}})(window);})();
//# sourceMappingURL=tracker.global.js.map