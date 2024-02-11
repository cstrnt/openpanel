"use strict";(()=>{function m(s){return Promise.all(Object.entries(s).map(async([t,e])=>[t,await e??""])).then(t=>Object.fromEntries(t))}function P(s){let t={"Content-Type":"application/json"};return{headers:t,async fetch(e,i,o){let a=`${s}${e}`,h,w=await m(t);return new Promise(p=>{let u=n=>{clearTimeout(h),fetch(a,{headers:w,method:"POST",body:JSON.stringify(i??{}),keepalive:!0,...o??{}}).then(async c=>{if(c.status!==200&&c.status!==202)return f(n,p);let g=await c.text();if(!g)return p(null);p(g)}).catch(()=>f(n,p))};function f(n,c){if(n>1)return c(null);h=setTimeout(()=>{u(n+1)},Math.pow(2,n)*500)}u(0)})}}}var l=class{options;api;state={properties:{}};constructor(t){this.options=t,this.api=P(t.url),this.api.headers["mixan-client-id"]=t.clientId,this.options.clientSecret&&(this.api.headers["mixan-client-secret"]=this.options.clientSecret)}init(t){this.state.properties=t??{}}setUser(t){this.api.fetch("/profile",{profileId:this.getProfileId(),...t,properties:{...this.state.properties,...t.properties}})}increment(t,e){this.api.fetch("/profile/increment",{property:t,value:e,profileId:this.getProfileId()})}decrement(t,e){this.api.fetch("/profile/decrement",{property:t,value:e,profileId:this.getProfileId()})}event(t,e){this.api.fetch("/event",{name:t,properties:{...this.state.properties,...e??{}},timestamp:this.timestamp(),profileId:this.getProfileId()}).then(i=>{this.options.setProfileId&&i&&this.options.setProfileId(i)})}setGlobalProperties(t){this.state.properties={...this.state.properties,...t}}clear(){this.state.profileId=void 0,this.options.removeProfileId&&this.options.removeProfileId()}timestamp(){return new Date().toISOString()}getProfileId(){if(this.state.profileId)return this.state.profileId;this.options.getProfileId&&(this.state.profileId=this.options.getProfileId()||void 0)}};var d=class extends l{lastPath="";constructor(t){super(t),this.options.trackOutgoingLinks&&this.trackOutgoingLinks(),this.options.trackScreenViews&&this.trackScreenViews()}isServer(){return typeof document>"u"}trackOutgoingLinks(){this.isServer()||document.addEventListener("click",t=>{let e=t.target;if(e.tagName==="A"){let i=e.getAttribute("href");i?.startsWith("http")&&super.event("link_out",{href:i,text:e.innerText})}})}trackScreenViews(){if(this.isServer())return;let t=history.pushState;history.pushState=function(...o){let a=t.apply(this,o);return window.dispatchEvent(new Event("pushstate")),window.dispatchEvent(new Event("locationchange")),a};let e=history.replaceState;history.replaceState=function(...o){let a=e.apply(this,o);return window.dispatchEvent(new Event("replacestate")),window.dispatchEvent(new Event("locationchange")),a},window.addEventListener("popstate",()=>window.dispatchEvent(new Event("locationchange"))),this.options.hash?window.addEventListener("hashchange",()=>this.screenView()):window.addEventListener("locationchange",()=>this.screenView()),this.screenView()}screenView(t){this.isServer()||this.lastPath!==window.location.href&&(this.lastPath=window.location.href,super.event("screen_view",{...t??{},path:window.location.href,title:document.title,referrer:document.referrer}))}};var r=document.currentScript;r&&(window.openpanel=new d({url:r?.getAttribute("data-url"),clientId:r?.getAttribute("data-client-id"),clientSecret:r?.getAttribute("data-client-secret"),trackOutgoingLinks:!!r?.getAttribute("data-track-outgoing-links"),trackScreenViews:!!r?.getAttribute("data-track-screen-views")}));})();
//# sourceMappingURL=cdn.global.js.map