const { links, createId } = require("../data/mockData");

const listLinks = (req, res) => {
  const ownerLinks = links.filter((link) => link.ownerId === req.user.id);

  return res.status(200).json({
    success: true,
    links: ownerLinks,
  });
};

const createLink = (req, res) => {
  const { destination, slug, vanity, title } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, message: "Destination URL is required." });
  }

  try {
    new URL(destination);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Please provide a valid destination URL." });
  }

  const normalizedSlug = (vanity || slug || "").trim().toLowerCase();
  const shortCode = normalizedSlug || createId("link").slice(-6);

  const duplicate = links.find(
    (entry) =>
      entry.ownerId === req.user.id &&
      (entry.shortCode === shortCode || entry.vanity === normalizedSlug || entry.shortCode === shortCode)
  );

  if (duplicate) {
    return res.status(409).json({ success: false, message: "This short link or vanity slug is already in use." });
  }

  const newLink = {
    id: createId("link"),
    ownerId: req.user.id,
    destination,
    shortCode,
    vanity: normalizedSlug || shortCode,
    title: title || "Untitled link",
    clicks: 0,
    createdAt: new Date().toISOString(),
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://brandlinkhub.com/r/${shortCode}`)}`,
  };

  links.push(newLink);

  return res.status(201).json({ success: true, message: "Short link created successfully.", link: newLink });
};

const deleteLink = (req, res) => {
  const linkIndex = links.findIndex((entry) => entry.id === req.params.id && entry.ownerId === req.user.id);

  if (linkIndex === -1) {
    return res.status(404).json({ success: false, message: "Link not found." });
  }

  const [removed] = links.splice(linkIndex, 1);
  return res.status(200).json({ success: true, message: "Link removed.", link: removed });
};

module.exports = {
  listLinks,
  createLink,
  deleteLink,
};
