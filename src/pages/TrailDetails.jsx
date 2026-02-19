import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { tripsAPI, userProfileAPI } from "../api/api";
import { useAuth } from "../auth/useAuth";
import mapboxgl from "mapbox-gl";

export default function TrailDetails() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapContainerReady, setMapContainerReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapReadyRef = useRef(false);

  useEffect(() => {
    fetchTrailDetails();
  }, [id]);

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
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
      setMapReady(false);
    };
  }, [MAPBOX_TOKEN, mapContainerReady]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (!mapRef.current) return;
    if (!mapReady) return;
    if (!trail?.trip_location) return;
    let cancelled = false;

    const loadMarker = async () => {
      setLocationError(null);
      const coords = await geocodeLocation(trail.trip_location);
      if (!coords || cancelled) {
        if (!cancelled) {
          setLocationError("Unable to locate this trail on the map.");
        }
        return;
      }

      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: "#d4773d" })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(
            `<strong>${trail.trip_name}</strong><br/>${trail.trip_location}`,
          ),
        )
        .addTo(mapRef.current);
      mapRef.current.easeTo({ center: coords, zoom: 6 });
      mapRef.current.resize();
    };

    loadMarker().catch((err) => {
      if (!cancelled) {
        setLocationError(err?.message || "Unable to load map location.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [MAPBOX_TOKEN, trail, mapReady]);

  const geocodeLocation = async (location) => {
    if (!MAPBOX_TOKEN) return null;

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
    return data.features?.[0]?.center || null;
  };

  const fetchTrailDetails = async () => {
    try {
      setLoading(true);
      const data = await tripsAPI.getById(id);
      setTrail(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    if (!token) {
      alert("Please log in to join trips");
      navigate("/login");
      return;
    }

    try {
      await userProfileAPI.assignTrip(trail.id);
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
        <p>Loading trail details...</p>
      </main>
    );
  }

  if (error || !trail) {
    return (
      <main className="container">
        <p>Error loading trail: {error || "Trail not found"}</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="trail-details-header">
        <Link to="/" className="back-link">
          ← Back to Trails
        </Link>
      </div>

      <section className="trail-details">
        <div className="trail-details-content">
          <h1>{trail.trip_name}</h1>

          <div className="trail-meta">
            {trail.trip_location && (
              <span className="trail-location">📍 {trail.trip_location}</span>
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
          </div>

          {trail.photo_urls && trail.photo_urls.length > 0 && (
            <div className="trail-gallery">
              <div className="main-image">
                <img
                  src={trail.photo_urls[selectedImage]}
                  alt={`${trail.trip_name} - Image ${selectedImage + 1}`}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x500?text=Image+Not+Available";
                  }}
                />
              </div>
              <div className="thumbnail-gallery">
                {trail.photo_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${trail.trip_name} thumbnail ${index + 1}`}
                    className={selectedImage === index ? "active" : ""}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="trail-map-section">
            <div className="map-header">
              <h3>Trail Location</h3>
              <p>Map marker is based on the trail's general state location.</p>
            </div>
            {!MAPBOX_TOKEN ? (
              <p className="map-warning">Add a Mapbox token to view maps.</p>
            ) : !trail.trip_location ? (
              <p className="map-warning">
                No location available for this trail.
              </p>
            ) : mapError ? (
              <p className="map-warning">{mapError}</p>
            ) : locationError ? (
              <p className="map-warning">{locationError}</p>
            ) : (
              <div
                ref={(node) => {
                  mapContainerRef.current = node;
                  setMapContainerReady(Boolean(node));
                }}
                className="trail-map"
              />
            )}
          </div>

          <div className="trail-info">
            <div className="info-section">
              <h3>Description</h3>
              <p>{trail.trip_description}</p>
            </div>

            <div className="trail-stats">
              {trail.terrain_type && (
                <div className="stat-item">
                  <strong>Terrain Type:</strong>
                  <span>{trail.terrain_type}</span>
                </div>
              )}
              {trail.trail_length && (
                <div className="stat-item">
                  <strong>Trail Length:</strong>
                  <span>{trail.trail_length}</span>
                </div>
              )}
              {trail.estimated_time && (
                <div className="stat-item">
                  <strong>Estimated Time:</strong>
                  <span>{trail.estimated_time}</span>
                </div>
              )}
              {trail.trip_difficulty && (
                <div className="stat-item">
                  <strong>Difficulty:</strong>
                  <span>{trail.trip_difficulty}</span>
                </div>
              )}
            </div>

            <div className="trail-actions">
              <button
                className="btn-join-trip btn-large"
                onClick={handleJoinTrip}
                disabled={!token}
              >
                {token ? "Join This Trip" : "Login to Join"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
