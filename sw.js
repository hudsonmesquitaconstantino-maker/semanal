/* Offline permanente + atualizações automáticas — Semanal Guimas v6 */
var CACHE='semanal-guimas-v6';
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(['./','./index.html'])}));
 self.skipWaiting();
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){
  return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
 }));
 self.clients.claim();
});
self.addEventListener('fetch',function(e){
 if(e.request.method!=='GET') return;                 // Firebase envia POST — deixar passar direto
 var u=new URL(e.request.url);
 var mine=(u.origin===location.origin);
 var cdn=(u.hostname==='www.gstatic.com');            // scripts do Firebase: cachear p/ offline
 if(!mine&&!cdn) return;                              // demais domínios (ex.: banco de dados) intocados
 e.respondWith(
  fetch(e.request).then(function(res){
   var clone=res.clone();
   caches.open(CACHE).then(function(c){c.put(e.request,clone)});
   return res;
  }).catch(function(){
   return caches.match(e.request,{ignoreSearch:true}).then(function(r){
    return r||(mine?caches.match('./index.html'):Response.error());
   });
  })
 );
});
