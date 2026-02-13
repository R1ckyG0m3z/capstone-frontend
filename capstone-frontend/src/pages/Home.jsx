import { useEffect, useState } from "react";
import { Link } from "react-router";
import { tripsAPI, userProfileAPI } from "../api/api";
import { useAuth } from "../auth/useAuth";

export default function Home() {
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchTrails();
  }, []);

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
        trail.trip_difficulty?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredTrails(filtered);
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
            placeholder="Search trails by name, location, or difficulty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
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
                <button
                  className="btn-join-trip"
                  onClick={() => handleJoinTrip(trail.id)}
                  disabled={!token}
                >
                  {token ? "Join This Trip" : "Login to Join"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
