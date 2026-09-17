const bcrypt = require("bcryptjs");

const users = [];
const spaces = [];
const testimonials = [];
const links = [];
const bioProfiles = [];

const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const seedDemoData = () => {
  if (users.length > 0 || spaces.length > 0 || testimonials.length > 0) return;

  const demoOwner = {
    id: "owner_1",
    name: "Ava Morgan",
    email: "hello@acme.com",
    password: bcrypt.hashSync("demo123", 10),
    createdAt: new Date().toISOString(),
  };

  users.push(demoOwner);

  const demoSpace = {
    id: "space_1",
    ownerId: demoOwner.id,
    name: "Acme Corp",
    slug: "acme-corp",
    logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=200&q=80",
    description: "Customer stories that make the product feel instantly credible.",
    prompt: "What changed for you after using Acme Corp?",
    settings: {
      avatarRequired: true,
      starRatingRequired: true,
      customQuestions: ["Which team were you on?", "What was your biggest win?"],
    },
    createdAt: new Date().toISOString(),
  };

  spaces.push(demoSpace);

  testimonials.push(
    {
      id: "review_1",
      spaceId: demoSpace.id,
      status: "approved",
      featured: true,
      name: "Nina Patel",
      email: "nina@northstar.co",
      role: "Head of Growth",
      rating: 5,
      review: "Acme Corp made onboarding feel effortless. The team was quick, strategic, and incredibly thoughtful from day one.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      company: "Northstar",
      createdAt: new Date().toISOString(),
    },
    {
      id: "review_2",
      spaceId: demoSpace.id,
      status: "approved",
      featured: false,
      name: "Omar Chen",
      email: "omar@latticehq.io",
      role: "Product Lead",
      rating: 4,
      review: "The product quality is excellent and the support team always explains trade-offs clearly. We saw clear momentum in 3 weeks.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      company: "Lattice HQ",
      createdAt: new Date().toISOString(),
    },
    {
      id: "review_3",
      spaceId: demoSpace.id,
      status: "pending",
      featured: false,
      name: "Lena Brooks",
      email: "lena@sunline.io",
      role: "Operations Manager",
      rating: 5,
      review: "We needed a faster workflow and Acme Corp helped us design one that truly matched how our team works.",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&q=80",
      company: "Sunline",
      createdAt: new Date().toISOString(),
    },
    {
      id: "review_4",
      spaceId: demoSpace.id,
      status: "archived",
      featured: false,
      name: "David Kim",
      email: "david@streamcraft.dev",
      role: "VP Engineering",
      rating: 3,
      review: "Good execution overall, but we were still aligning on a few internal process details that required extra iteration.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      company: "Streamcraft",
      createdAt: new Date().toISOString(),
    }
  );

  links.push(
    {
      id: "link_1",
      ownerId: demoOwner.id,
      destination: "https://www.notion.so/", 
      shortCode: "bld-101",
      vanity: "summer-sale",
      title: "Summer launch",
      clicks: 1842,
      createdAt: new Date().toISOString(),
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://brandlinkhub.com/r/summer-sale",
    },
    {
      id: "link_2",
      ownerId: demoOwner.id,
      destination: "https://www.behance.net/",
      shortCode: "bio-42",
      vanity: "portfolio",
      title: "Portfolio",
      clicks: 962,
      createdAt: new Date().toISOString(),
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://brandlinkhub.com/r/portfolio",
    }
  );

  bioProfiles.push({
    id: "bio_1",
    username: "ava",
    displayName: "Ava Morgan",
    bio: "Product storyteller building smarter communities and better customer journeys.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    theme: "dark-slate",
    links: [
      { label: "Portfolio", url: "https://behance.net" },
      { label: "Newsletter", url: "https://substack.com" },
      { label: "Instagram", url: "https://instagram.com" },
    ],
    createdAt: new Date().toISOString(),
  });
};

module.exports = {
  users,
  spaces,
  testimonials,
  links,
  bioProfiles,
  createId,
  seedDemoData,
};
