import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../auth/useAuth";
import { userProfileAPI } from "../api/api";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    about_me: "",
    vehicle_type: "",
    photo_url: "",
    bio: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const profileData = await userProfileAPI.getByUserId(userId);
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          about_me: profileData.about_me || "",
          vehicle_type: profileData.vehicle_type || "",
          photo_url: profileData.photo_url || "",
          bio: profileData.bio || "",
        });

        const tripsData = await userProfileAPI.getTrips(userId);
        setTrips(tripsData || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate]);

  const handleRemoveTrip = async (tripId) => {
    if (!confirm("Are you sure you want to remove this trip?")) {
      return;
    }

    try {
      await userProfileAPI.removeTrip(tripId);
      // Refresh trips - refetch all data
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const tripsData = await userProfileAPI.getTrips(userId);
      setTrips(tripsData || []);
      alert("Trip removed successfully!");
    } catch (err) {
      console.error("Error removing trip:", err);
      alert(err.message || "Failed to remove trip");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setFormData({
        name: profile.name || "",
        about_me: profile.about_me || "",
        vehicle_type: profile.vehicle_type || "",
        photo_url: profile.photo_url || "",
        bio: profile.bio || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await userProfileAPI.update(formData);
      setProfile(updatedProfile);
      setFormData({
        name: updatedProfile.name || "",
        about_me: updatedProfile.about_me || "",
        vehicle_type: updatedProfile.vehicle_type || "",
        photo_url: updatedProfile.photo_url || "",
        bio: updatedProfile.bio || "",
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <main className="container">
        <section className="profile-section">
          <h2>My Profile</h2>
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <section className="profile-section">
          <h2>Profile Error</h2>
          <p style={{ color: "#e74c3c" }}>Error loading profile: {error}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: "1rem" }}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="profile-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>My Profile</h2>
          <button
            className="btn-primary"
            onClick={handleEditToggle}
            style={{ backgroundColor: isEditing ? "#95a5a6" : "#3498db" }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
        <div className="profile-content">
          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <h3>Edit Profile Information</h3>

                {formData.photo_url && (
                  <div className="profile-photo">
                    <img
                      src={formData.photo_url}
                      alt="Profile preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="about_me">About Me:</label>
                  <textarea
                    id="about_me"
                    name="about_me"
                    value={formData.about_me}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vehicle_type">Vehicle Type:</label>
                  <input
                    type="text"
                    id="vehicle_type"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    placeholder="e.g., 4x4 Jeep, SUV, Truck"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="photo_url">Photo URL:</label>
                  <input
                    type="url"
                    id="photo_url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio (Legacy):</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Additional bio information..."
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Save Profile
                </button>
              </form>
            ) : (
              <>
                <h3>Account Information</h3>
                {profile ? (
                  <>
                    {profile.photo_url && (
                      <div className="profile-photo">
                        <img
                          src={profile.photo_url}
                          alt={profile.name || "Profile"}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    {profile.name && (
                      <p>
                        <strong>Name:</strong> {profile.name}
                      </p>
                    )}
                    {profile.about_me && (
                      <p>
                        <strong>About Me:</strong> {profile.about_me}
                      </p>
                    )}
                    {profile.vehicle_type && (
                      <p>
                        <strong>Vehicle:</strong> {profile.vehicle_type}
                      </p>
                    )}
                    <p>
                      <strong>User ID:</strong> {profile.user_id}
                    </p>
                    {profile.created_at && (
                      <p>
                        <strong>Profile Created:</strong>{" "}
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {profile.bio && (
                      <p>
                        <strong>Bio:</strong> {profile.bio}
                      </p>
                    )}
                  </>
                ) : (
                  <p>Loading profile information...</p>
                )}
              </>
            )}
          </div>

          <div className="profile-trips">
            <h3>My Trips {trips.length > 0 && `(${trips.length})`}</h3>
            <div className="trips-list">
              {trips.length === 0 ? (
                <div className="no-trips">
                  <p>
                    You haven&apos;t joined any trips yet. Explore trails and
                    join some adventures!
                  </p>
                  <Link
                    to="/"
                    className="btn-primary"
                    style={{
                      display: "inline-block",
                      marginTop: "1rem",
                      textDecoration: "none",
                    }}
                  >
                    Browse Trails
                  </Link>
                </div>
              ) : (
                trips.map((trip) => (
                  <div key={trip.id} className="trip-item">
                    <h4>{trip.trip_name}</h4>
                    {trip.trip_location && <p>📍 {trip.trip_location}</p>}
                    {trip.trip_difficulty && (
                      <span className="trip-status status-joined">
                        {trip.trip_difficulty}
                      </span>
                    )}
                    {trip.trip_description && (
                      <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        {trip.trip_description}
                      </p>
                    )}
                    {trip.terrain_type && (
                      <p style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>
                        <strong>Terrain:</strong> {trip.terrain_type}
                      </p>
                    )}
                    <button
                      className="btn-join-trip"
                      onClick={() => handleRemoveTrip(trip.id)}
                      style={{
                        backgroundColor: "#e74c3c",
                        marginTop: "0.5rem",
                      }}
                    >
                      Remove Trip
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
