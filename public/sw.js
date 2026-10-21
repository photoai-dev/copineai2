// "Kill switch" : remplace l'ancien service worker de love20, resté actif dans les
// navigateurs ayant visité le site avant la bascule du domaine vers ce projet (#110).
// Cet ancien SW interceptait les navigations et servait parfois une version en cache
// de "/" (l'app love20, menu différent) à la place de la vraie page — d'où "2 pages
// d'accueil différentes" selon le chemin de navigation. Celui-ci se désinstalle
// lui-même, vide tous les caches qu'il contrôle, puis recharge les onglets ouverts
// pour qu'ils retombent immédiatement sur le réseau (donc sur la vraie page Next.js).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: "window" });
      for (const client of clientsList) {
        client.navigate(client.url);
      }
    })()
  );
});
