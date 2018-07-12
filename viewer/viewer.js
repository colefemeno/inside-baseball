let $ = (selector, scope = document) => {
    return scope.querySelector(selector);
};

let $$ = (selector, scope = document) => {
    return Array.from(scope.querySelectorAll(selector));
};

function removeChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

let allPoints, allItems;

let baseballIcon = L.icon({
    iconUrl: "static/icons/baseball-ball-solid.svg",
    iconSize: [32, 32],
    iconAnchor: [12, 12],
    popupAnchor: [0, 0]
});

let map = L.map("viewer-map", {
    zoom: 3
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let itemLayer = L.layerGroup().addTo(map);

fetch("InsideBaseball.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        allPoints = data.points;
        allItems = data.items;

        allPoints.forEach(point => {
            let title = point.title || JSON.stringify(point.latlng);

            L.marker(point.latlng, {
                title: title,
                items: point.items
            })
                .bindPopup(title)
                .on("click", function(evt) {
                    displayItems(evt.target.options.items);
                })
                .addTo(itemLayer);
        });
    });

fetch(
    "https://raw.githubusercontent.com/cageyjames/GeoJSON-Ballparks/master/ballparks.geojson"
)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let ballparksLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                let props = feature.properties,
                    title = `${props.Ballpark} (${props.Team})`;

                return L.marker(latlng, {
                    icon: baseballIcon,
                    title: title
                });
            }
        });

        // Now that we have a layer, we'll add a control for toggling them:
        L.control.layers(null, { "Present Day Ballparks": ballparksLayer }).addTo(map);
    });

map.setView({ lat: 38.8879105, lng: -77.0024652 }, 7);

let itemListing = $("#viewer-items > ul");

function displayItems(itemIDs) {
    removeChildren(itemListing);

    itemIDs.forEach(itemID => {
        let item = allItems[itemID];
        // Convenience aliases
        let title = item.title;
        let meta = item.metadata;

        let itemContainer = document.createElement("li");
        itemContainer.classList.add("list-group-item");
        itemListing.appendChild(itemContainer);

        let itemLink = document.createElement("a");
        itemLink.textContent = title;
        itemLink.href = meta["Digital ID URL"];
        itemLink.target = "_blank";

        itemContainer.appendChild(itemLink);
    });
}