import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Card } from "../components/ui";
import { authAPI } from "../services/api";

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let data;
        if (isOwnProfile) {
          const res = await authAPI.getMe();
          data = res.data.user;
        } else {
          const res = await authAPI.getProfile(id);
          data = res.data.user;
        }
        setProfile(data);
        setForm(data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      setProfile(form);
      setEditMode(false);
    } catch (e) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-6">
        <div className="flex flex-col items-center">
          <img
            src={profile.cover || "https://placehold.co/800x200?text=Cover"}
            alt="cover"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <img
            src={
              profile.avatar || "https://i.pravatar.cc/150?u=" + profile.email
            }
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-white -mt-16 mb-2"
          />
          <h2 className="text-2xl font-bold mt-2">{profile.name}</h2>
          <p className="text-gray-600">{profile.bio}</p>
          <p className="text-gray-500 text-sm mt-1">
            {profile.birthday
              ? new Date(profile.birthday).toLocaleDateString()
              : ""}{" "}
            {profile.gender && `| ${profile.gender}`}
          </p>
          {isOwnProfile && !editMode && (
            <Button className="mt-4" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>
        {isOwnProfile && editMode && (
          <form onSubmit={onSave} className="mt-6 space-y-3">
            <Input
              name="firstName"
              value={form.firstName || ""}
              onChange={onChange}
              placeholder="First Name"
            />
            <Input
              name="lastName"
              value={form.lastName || ""}
              onChange={onChange}
              placeholder="Last Name"
            />
            <Input
              name="avatar"
              value={form.avatar || ""}
              onChange={onChange}
              placeholder="Avatar URL"
            />
            <Input
              name="cover"
              value={form.cover || ""}
              onChange={onChange}
              placeholder="Cover Photo URL"
            />
            <Input
              name="bio"
              value={form.bio || ""}
              onChange={onChange}
              placeholder="Bio"
            />
            <Input
              name="birthday"
              type="date"
              value={form.birthday ? form.birthday.slice(0, 10) : ""}
              onChange={onChange}
              placeholder="Birthday"
            />
            <select
              name="gender"
              value={form.gender || ""}
              onChange={onChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Profile;
