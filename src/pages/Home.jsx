import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { tripsAPI, userProfileAPI } from "../api/api";
import { useAuth } from "../auth/useAuth";
import mapboxgl from "mapbox-gl";

export default function Home() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapContainerReady, setMapContainerReady] = useState(false);
  const { token } = useAuth();
  const mapSectionRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geocodeCacheRef = useRef(new Map());
  const mapReadyRef = useRef(false);

  useEffect(() => {
    fetchTrails();
  }, []);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("Map unavailable. Add VITE_MAPBOX_TOKEN to .env.");
      return;
    }
    if (mapRef.current) return;
    if (!mapContainerReady || !mapContainerRef.current) return;
    if (!mapboxgl?.Map) {
      setMapError("Map unavailable. Please refresh.");
      return;
    }

    if (!mapboxgl.supported()) {
      setMapError("Map requires WebGL support in your browser.");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [-98.5795, 39.8283],
        zoom: 3,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
    } catch (err) {
      setMapError("Map unavailable. Please refresh.");
      return;
    }

    mapRef.current.on("error", (event) => {
      if (event?.error?.message) {
        setMapError("Map unavailable. Please refresh.");
      }
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current || mapReadyRef.current) return;
      mapReadyRef.current = true;
      setMapReady(true);

      mapRef.current.addSource("trails", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 6,
        clusterRadius: 50,
      });

      mapRef.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "trails",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#d4773d",
          "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 10, 30],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#4a3f35",
        },
      });

      mapRef.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "trails",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      mapRef.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "trails",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#8b6f47",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f5e6d3",
        },
      });

      mapRef.current.on("click", "clusters", (event) => {
        const features = mapRef.current.queryRenderedFeatures(event.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = mapRef.current.getSource("trails");
        if (!source || clusterId === undefined) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          mapRef.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        });
      });

      mapRef.current.on("click", "unclustered-point", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = feature.geometry.coordinates.slice();
        const name = feature.properties?.name || "Trail";
        const location = feature.properties?.location || "";
        new mapboxgl.Popup({ offset: 20 })
          .setLngLat(coordinates)
          .setHTML(`<strong>${name}</strong><br/>${location}`)
          .addTo(mapRef.current);
      });

      mapRef.current.on("mouseenter", "clusters", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "clusters", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
      mapRef.current.on("mouseenter", "unclustered-point", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "unclustered-point", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
      setMapReady(false);
    };
  }, [MAPBOX_TOKEN, mapContainerReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapReady) return;
    if (!MAPBOX_TOKEN) return;
    let cancelled = false;

    const updateMapData = async () => {
      setLocationError(null);
      const features = [];

      for (const trail of filteredTrails) {
        if (!trail.trip_location) continue;
        try {
          const coords = await geocodeLocation(trail.trip_location);
          if (!coords || cancelled) {
            setLocationError("Some trail locations could not be mapped.");
            continue;
          }
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: coords },
            properties: {
              id: trail.id,
              name: trail.trip_name || "Trail",
              location: trail.trip_location || "",
            },
          });
        } catch (err) {
          if (!cancelled) {
            setLocationError("Some trail locations could not be mapped.");
          }
        }
      }

      if (cancelled) return;
      const source = mapRef.current.getSource("trails");
      if (source) {
        source.setData({ type: "FeatureCollection", features });
      }

      if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach((feature) => {
          bounds.extend(feature.geometry.coordinates);
        });
        mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 7 });
      }

      mapRef.current.resize();
    };

    updateMapData().catch((err) => {
      if (!cancelled) {
        setLocationError(err?.message || "Unable to load map locations.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [MAPBOX_TOKEN, filteredTrails, mapReady]);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const data = await tripsAPI.getAll();
      setTrails(data);
      setFilteredTrails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredTrails(trails);
      return;
    }

    const filtered = trails.filter(
      (trail) =>
        trail.trip_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.trip_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.trip_difficulty
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        trail.trip_description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
    setFilteredTrails(filtered);
  };

  const geocodeLocation = async (location) => {
    if (!MAPBOX_TOKEN) return null;

    const cacheKey = location.toLowerCase();
    if (geocodeCacheRef.current.has(cacheKey)) {
      return geocodeCacheRef.current.get(cacheKey);
    }

    const query = encodeURIComponent(location);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=us&types=region&autocomplete=false`;
    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Mapbox geocoding failed (${response.status}): ${body || "No details"}`,
      );
    }

    const data = await response.json();
    const coords = data.features?.[0]?.center || null;
    geocodeCacheRef.current.set(cacheKey, coords);
    return coords;
  };

  const handleJoinTrip = async (tripId) => {
    if (!token) {
      alert("Please log in to join trips");
      return;
    }

    try {
      await userProfileAPI.assignTrip(tripId);
      alert(
        "Successfully joined the trip! Check your profile to see all your trips.",
      );
    } catch (err) {
      console.error("Error joining trip:", err);
      const errorMessage = err.message || "Failed to join trip";
      if (
        errorMessage.includes("duplicate") ||
        errorMessage.includes("already")
      ) {
        alert("You have already joined this trip!");
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleViewOnMap = async (trail) => {
    if (!MAPBOX_TOKEN) {
      alert("Set VITE_MAPBOX_TOKEN in your .env to enable the map view.");
      return;
    }

    if (!trail.trip_location) {
      alert("This trail does not have a location to map.");
      return;
    }

    mapSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    if (!mapRef.current || !mapReady) return;

    try {
      const coords = await geocodeLocation(trail.trip_location);
      if (!coords) {
        setLocationError("Unable to locate this trail on the map.");
        return;
      }
      new mapboxgl.Popup({ offset: 20 })
        .setLngLat(coords)
        .setHTML(
          `<strong>${trail.trip_name}</strong><br/>${trail.trip_location}`,
        )
        .addTo(mapRef.current);
      mapRef.current.easeTo({ center: coords, zoom: 6 });
    } catch (err) {
      setLocationError(err?.message || "Unable to load map location.");
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "difficulty-easy";
      case "moderate":
        return "difficulty-moderate";
      case "difficult":
        return "difficulty-difficult";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <main className="container">
        <p>Loading trails...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p>Error loading trails: {error}</p>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="hero">
        <h2>Discover Epic 4x4 Off-Road Trails</h2>
        <p>Explore the best off-road adventures across the United States</p>
      </section>

      <section className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search trails by name, location, difficulty, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="map-section" ref={mapSectionRef}>
        <div className="map-header">
          <h3>Trail Locations</h3>
          <p>Map markers are based on the trail's general state location.</p>
        </div>
        {!MAPBOX_TOKEN ? (
          <p className="map-warning">
            Set VITE_MAPBOX_TOKEN in your .env to enable the map view.
          </p>
        ) : mapError ? (
          <p className="map-warning">{mapError}</p>
        ) : (
          <div>
            <div
              ref={(node) => {
                mapContainerRef.current = node;
                setMapContainerReady(Boolean(node));
              }}
              className="trails-map"
            />
            {locationError && <p className="map-warning">{locationError}</p>}
          </div>
        )}
      </section>

      <section className="trails-section">
        <h3>Featured Off-Road Trails</h3>
        <div className="trails-grid">
          {filteredTrails.length === 0 ? (
            <p className="no-trips">No trails found matching your search.</p>
          ) : (
            filteredTrails.map((trail) => (
              <div key={trail.id} className="trail-card">
                <Link to={`/trail/${trail.id}`} className="trail-card-link">
                  <h4>{trail.trip_name}</h4>
                  {trail.trip_location && (
                    <p className="trail-location">📍 {trail.trip_location}</p>
                  )}
                  {trail.trip_difficulty && (
                    <span
                      className={`trail-difficulty ${getDifficultyClass(
                        trail.trip_difficulty,
                      )}`}
                    >
                      {trail.trip_difficulty}
                    </span>
                  )}
                  {trail.trip_description && <p>{trail.trip_description}</p>}
                  {trail.terrain_type && (
                    <p>
                      <strong>Terrain:</strong> {trail.terrain_type}
                    </p>
                  )}
                </Link>
                <div className="trail-card-actions">
                  <button
                    className="btn-join-trip"
                    onClick={() => handleJoinTrip(trail.id)}
                    disabled={!token}
                  >
                    {token ? "Join This Trip" : "Login to Join"}
                  </button>
                  <button
                    className="btn-map-view"
                    onClick={() => handleViewOnMap(trail)}
                    disabled={!MAPBOX_TOKEN || !trail.trip_location}
                  >
                    View on Map
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
