const CACHE_NAME='focus-hub-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./service-worker.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE_NAME?null:caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{caches.open(CACHE_NAME).then(c=>c.put(req,r.clone()));return r;}).catch(()=>caches.match('./index.html')));
  } else {
    e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{caches.open(CACHE_NAME).then(c=>c.put(req,r.clone()));return r;})));
  }
});