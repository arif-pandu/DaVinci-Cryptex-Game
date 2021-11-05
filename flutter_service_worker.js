'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "6322da39eb9fe5c8f66cb477f72dd369",
"assets/assets/font/century_gothic/Century%2520Gothic.ttf": "cfce6abbbff0099b15691345d8b94dcc",
"assets/assets/font/century_gothic/gothicb.ttf": "ae704b1128b630b4b838a9c85a53e653",
"assets/assets/font/cocogoose/Cocogoose%2520Pro%2520Light-trial.ttf": "b4e46f03d0e03a9192dc3c2ad1a4e104",
"assets/assets/font/cocogoose/Cocogoose%2520Pro%2520Semilight-trial.ttf": "39b86773ce0ca6575430484e263746e2",
"assets/assets/font/cocogoose/Cocogoose%2520Pro%2520Thin-trial.ttf": "d85c699a2cf2aa2c04d034bcea9aa8a9",
"assets/assets/font/cocogoose/Cocogoose%2520Pro%2520Ultralight-trial.ttf": "970dcca1d4f88e36064431b05be1757b",
"assets/assets/font/couture/couture-bld.otf": "82500e0dc8f651ac1a0849c8fc32cf07",
"assets/assets/font/helvetica/Helvetica-Bold.ttf": "d13db1fed3945c3b8c3293bfcfadb32f",
"assets/assets/font/helvetica/Helvetica.ttf": "1b580d980532792578c54897ca387e2c",
"assets/assets/splash.png": "3ca14608acf80fc9b2c25d424dc4ba56",
"assets/FontManifest.json": "2a2a2faf445ab79604b21e664be52bcf",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/lib/json/question_list.json": "3fd4f2de0e7b695ee8104ca8c95e1630",
"assets/lib/json/question_list_2.json": "d433c50bd173e715b5e4c952746b344d",
"assets/NOTICES": "5c23f6970460bf339cbfa616520ec8f4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "cfa3e7f064de90978e8630298c0bba70",
"/": "cfa3e7f064de90978e8630298c0bba70",
"main.dart.js": "279bd0bae25453075fab2219e1ab3505",
"manifest.json": "3d55af4e013ee8f256adacbaa6603a74",
"splash/img/dark-1x.png": "521030121f33abafa77464d059823a61",
"splash/img/dark-2x.png": "459c9d00318b0039aa6315b93538becc",
"splash/img/dark-3x.png": "c14501a90fe67710ef43d043ec15ac75",
"splash/img/dark-4x.png": "6f5e2cd513dce4ff95592fa5f2156eb6",
"splash/img/light-1x.png": "521030121f33abafa77464d059823a61",
"splash/img/light-2x.png": "459c9d00318b0039aa6315b93538becc",
"splash/img/light-3x.png": "c14501a90fe67710ef43d043ec15ac75",
"splash/img/light-4x.png": "6f5e2cd513dce4ff95592fa5f2156eb6",
"splash/style.css": "64227ec06c71fef909f75868ada72c30",
"version.json": "9f09955351c550d8e35aadef3af1d80f"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
