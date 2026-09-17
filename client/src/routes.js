export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password/:token',
  dashboard: '/dashboard',
  spaces: '/dashboard/spaces',
  newSpace: '/dashboard/spaces/new',
  space: '/dashboard/spaces/:spaceId',
  reviews: '/dashboard/spaces/:spaceId/reviews',
  settings: '/dashboard/spaces/:spaceId/settings',
  embed: '/dashboard/spaces/:spaceId/embed',
  profile: '/dashboard/profile',
  collect: '/collect/:spaceSlug',
  wall: '/wall/:spaceSlug',
};

export const resolveRoute = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return { name: 'home', segments };
  if (['login', 'signup', 'verify-email', 'forgot-password'].includes(segments[0]) && segments.length === 1) return { name: segments[0], segments };
  if (segments[0] === 'reset-password' && segments.length === 2) return { name: 'reset-password', segments };
  if (segments[0] === 'collect' && segments.length === 2) return { name: 'collect', segments };
  if (segments[0] === 'wall' && segments.length === 2) return { name: 'wall', segments };
  if (segments[0] === 'dashboard') {
    if (segments.length === 1) return { name: 'dashboard', segments };
    if (segments[1] === 'spaces' && segments.length === 2) return { name: 'spaces', segments };
    if (segments[1] === 'spaces' && segments[2] === 'new' && segments.length === 3) return { name: 'new-space', segments };
    if (segments[1] === 'spaces' && segments.length === 3) return { name: 'space', segments };
    if (segments[1] === 'spaces' && ['reviews', 'settings', 'embed'].includes(segments[3]) && segments.length === 4) return { name: segments[3], segments };
    if (segments[1] === 'profile' && segments.length === 2) return { name: 'profile', segments };
  }
  return { name: 'not-found', segments };
};
