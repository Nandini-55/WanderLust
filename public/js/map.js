maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const el = document.createElement("div");
el.className = "custom-marker";

el.innerHTML = '<i class="fa-regular fa-compass icon"></i>';

el.addEventListener("mouseenter", () => {
  el.innerHTML = '<i class="fa-solid fa-house icon"></i>';
});

el.addEventListener("mouseleave", () => {
  el.innerHTML = '<i class="fa-regular fa-compass icon"></i>';
});

new maptilersdk.Marker({ element: el })
  .setLngLat(coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h4>${place}</h4> <p> Exact Location will be proivded after booking</p>`,
    ),
  )
  .addTo(map); //listing.geometry.corodinates
