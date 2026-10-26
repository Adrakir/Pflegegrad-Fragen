/* Public offline shell only. No runtime caching, credentials, or external requests. */
'use strict';
const CACHE_PREFIX='pflegegrad-fragen-public-',CACHE_NAME=CACHE_PREFIX+'__CACHE_VERSION__';
const PUBLIC_FILES=__PRECACHE__;
const FILE_URLS=PUBLIC_FILES.map(p=>new URL(p,self.registration.scope).href),ALLOWED=new Set(FILE_URLS);
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);try{await Promise.all(FILE_URLS.map(async url=>{const response=await fetch(url,{cache:'reload',credentials:'omit'});if(!response.ok)throw Error('Datei nicht verfügbar');await cache.put(url,response);}));}catch(error){await caches.delete(CACHE_NAME);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_PUBLIC_UPDATE')self.skipWaiting();if(event.data?.type==='PUBLIC_CACHE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);const keys=await cache.keys();event.ports[0]?.postMessage({version:CACHE_NAME,count:keys.length,expected:FILE_URLS.length,ready:keys.length===FILE_URLS.length});})());});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;let key=req.url;
 if(req.mode==='navigate'){const clean=new URL(url.pathname,self.location.origin).href;if(ALLOWED.has(clean))key=clean;else return;}
 else if(!ALLOWED.has(key))return;
 event.respondWith((async()=>{try{const response=await fetch(req);if(response.ok)return response;const cached=await(await caches.open(CACHE_NAME)).match(key);return cached||response;}catch(error){const cached=await(await caches.open(CACHE_NAME)).match(key);if(cached)return cached;return new Response('Dieser öffentliche Inhalt wurde nicht für offline gespeichert. Bitte eine Verbindung herstellen.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
