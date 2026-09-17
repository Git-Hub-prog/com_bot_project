const { bioProfiles } = require("../data/mockData");

const getMyBioProfile = (req, res) => {
  const profile = bioProfiles.find((entry) => entry.id === req.user.id || entry.username === req.user.username);

  return res.status(200).json({
    success: true,
    profile: profile || null,
  });
};

const upsertBioProfile = (req, res) => {
  const { username, displayName, bio, avatar, theme, links } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({ success: false, message: "Username and display name are required." });
  }

  let profile = bioProfiles.find((entry) => entry.username === username);

  if (!profile) {
    profile = {
      id: req.user.id,
      username,
      displayName,
      bio: bio || "",
      avatar: avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      theme: theme || "dark-slate",
      links: Array.isArray(links) ? links : [],
      createdAt: new Date().toISOString(),
    };

    bioProfiles.push(profile);
  } else {
    profile.displayName = displayName;
    profile.bio = bio || profile.bio;
    profile.avatar = avatar || profile.avatar;
    profile.theme = theme || profile.theme;
    profile.links = Array.isArray(links) ? links : profile.links;
    profile.updatedAt = new Date().toISOString();

    if (profile.id !== req.user.id) {
      profile.id = req.user.id;
    }
  }

  return res.status(200).json({ success: true, message: "Bio profile saved.", profile });
};

const getPublicBioProfile = (req, res) => {
  const profile = bioProfiles.find((entry) => entry.username === req.params.username);

  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found." });
  }

  return res.status(200).json({ success: true, profile });
};

module.exports = {
  getMyBioProfile,
  upsertBioProfile,
  getPublicBioProfile,
};
