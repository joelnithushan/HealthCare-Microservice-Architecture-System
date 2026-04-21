import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { DEFAULT_AVATAR } from "../utils/constants";
import { resolveProfileImageUrl } from "../utils/profileImage";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const validateImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 128 || img.height < 128) {
        reject(new Error("Image must be at least 128x128 pixels."));
        return;
      }
      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions."));
    };

    img.src = objectUrl;
  });
};

const ProfilePicUpload = ({ user, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const profileImageSource = user.profilePicUrl || "";

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    // Validate size (max 5MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("File is too large. Maximum size is 5MB");
      e.target.value = "";
      return;
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid format. Use JPG, PNG, or WEBP image files.");
      e.target.value = "";
      return;
    }

    try {
      await validateImageDimensions(file);
    } catch (validationError) {
      toast.error(validationError.message || "Invalid image dimensions.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Determine endpoint based on role
      const endpoint =
        user.role === "DOCTOR"
          ? `/doctors/${user.id}/upload-profile-pic`
          : `/users/${user.id}/upload-profile-pic`;

      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPicUrl = response.data.profilePicUrl;
      const t = Date.now();
      setTimestamp(t);
      toast.success("Profile picture updated!");

      if (onUploadSuccess) {
        onUploadSuccess(`${newPicUrl}?t=${t}`);
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload picture. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={styles.avatarWrapper}>
      <img
        src={resolveProfileImageUrl(profileImageSource, timestamp)}
        alt="Avatar"
        style={styles.avatar}
        onError={(event) => {
          if (event.currentTarget.src !== DEFAULT_AVATAR) {
            event.currentTarget.src = DEFAULT_AVATAR;
          }
        }}
      />
      {uploading && (
        <div style={styles.uploadingOverlay}>
          <span style={styles.spinner}></span>
        </div>
      )}
      <label style={styles.uploadBtn} title="Upload new profile picture">
        {uploading ? (
          "..."
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        )}
        <input
          type="file"
          style={{ display: "none" }}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

const styles = {
  avatarWrapper: {
    position: "relative",
    width: "80px",
    height: "80px",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid var(--primary)",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid var(--primary)",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  uploadBtn: {
    position: "absolute",
    bottom: "-4px",
    right: "-4px",
    background: "var(--primary)",
    color: "#fff",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
};

export default ProfilePicUpload;
