import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { tripsAPI, userProfileAPI } from "../api/api";
import { useAuth } from "../auth/useAuth";

export default function TrailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchTrailDetails();
  }, [id]);

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
