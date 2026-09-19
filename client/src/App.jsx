import { useEffect, useMemo, useState } from 'react';
import './App.css';
import './wall.css';
import './home.css';
import './landing.css';
import './space-card.css';
import './empty-states.css';
import './responsive.css';
import './accessibility.css';
import './confirm-dialog.css';
import './embed-page.css';
import './home-session.css';
import { demoSpace, demoTestimonials } from './data/demoData';
import { publicTestimonialSchema, spaceSchema } from './utils/validation';
import { ROUTES, resolveRoute } from './routes';
import { apiRequest } from './services/api';
import { useAuth } from './context/useAuth';
import { Button } from './components/ui/button';
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogTitle, DialogTrigger } from './components/ui/dialog';

const API = import.meta.env.VITE_API_URL || '/api';
void HomePageLegacy;
void LegacyEmbedPanel;
void EmbedPanel;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const validateImageFile = (file) => {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WebP image.';
  if (file.size > MAX_IMAGE_SIZE) return 'Images must be 5 MB or smaller.';
  return '';
};
function HomePage() {
  return <HomePageLanding />;
}

function HomePageLanding() {
  const { user } = useAuth();
  return <main className="home-shell"><div className="home-nav"><div className="public-brand"><div className="brand-symbol">T</div><strong>TestimonialHub</strong></div><div className="home-actions">{user ? <a className="button primary" href="/dashboard">Dashboard <span>→</span></a> : <><a className="text-button" href={ROUTES.login}>Sign in</a><a className="button primary" href={ROUTES.signup}>Create Your Space <span>→</span></a></>}</div></div><section className="home-hero"><span className="eyebrow">Customer stories, collected beautifully</span><h1>Collect authentic customer stories.<br /><em>Turn feedback into social proof.</em></h1><p>Give every happy customer an easy way to share their experience, then turn those words into proof your next customer can trust.</p><div className="home-cta">{user ? <a className="button primary" href="/dashboard">Go to Dashboard <span>→</span></a> : <a className="button primary" href={ROUTES.signup}>Create Your Space <span>→</span></a>}<a className="button secondary" href="/wall/acme">See Demo <span>↗</span></a></div></section><section className="home-sections"><article><span className="home-icon">01</span><h2>How it works</h2><p>Share one beautiful collection link. Customers respond in minutes. You choose what earns a place in your story.</p></article><article><span className="home-icon">02</span><h2>Moderate with confidence</h2><p>Review every submission, approve the best stories, and keep your public proof thoughtful and on-brand.</p></article><article><span className="home-icon">03</span><h2>Publish everywhere</h2><p>Showcase approved testimonials on a Wall of Love or add a lightweight embed widget to your website.</p></article></section><section className="home-feature-grid"><div><span className="eyebrow">Everything in one place</span><h2>Proof that gets better over time.</h2><p>See your collection grow with clear rating metrics, featured stories, and a searchable moderation inbox.</p><div className="home-stat-row"><strong>94%<small>response rate</small></strong><strong>4.8<small>average rating</small></strong><strong>128<small>customer stories</small></strong></div></div><div className="home-feature-card"><span className="eyebrow">Wall of Love</span><blockquote>“The easiest way we’ve found to turn customer wins into something our whole team can share.”</blockquote><span>— Maya, Customer Success Lead</span><div className="home-widget-preview"><b>What customers are saying</b><span>★★★★★</span><small>Featured testimonials · Grid widget</small></div></div></section></main>;
}
function HomePageLegacy() {
  return <main className="home-shell"><div className="home-nav"><div className="public-brand"><div className="brand-symbol">T</div><strong>TestimonialHub</strong></div><div className="home-actions"><a className="text-button" href={ROUTES.login}>Sign in</a><a className="button primary" href={ROUTES.signup}>Start collecting <span>→</span></a></div></div><section className="home-hero"><span className="eyebrow">Customer stories, collected beautifully</span><h1>Turn happy customers into your best marketing.</h1><p>Collect authentic testimonials, review every story, and publish social proof that helps the right customers say yes.</p><div className="home-cta"><a className="button primary" href={ROUTES.signup}>Create your free space <span>→</span></a><a className="button secondary" href="/wall/acme">See an example <span>↗</span></a></div></section><section className="home-proof"><div><strong>2 min</strong><span>to collect a story</span></div><div><strong>94%</strong><span>average response rate</span></div><div><strong>5.0</strong><span>average customer rating</span></div></section></main>;
}

function Stars({ value = 0, interactive = false, onChange }) {
  return (
    <div className={`stars ${interactive ? 'stars-interactive' : ''}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={!interactive} className={star <= value ? 'filled' : ''} onClick={() => onChange?.(star)} aria-label={`${star} stars`}>
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, src, size = 'medium' }) {
  return src ? <img className={`avatar ${size}`} src={src} alt="" loading="lazy" decoding="async" /> : <span className={`avatar ${size} avatar-fallback`}>{name?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>;
}

function Toast({ message }) {
  return message ? <div className="toast" role="status">{message}</div> : null;
}
function EmptyState({ title, message, action, onAction }) {
  return <div className="empty-state empty-state-enhanced"><div className="empty-state-mark">✦</div><h2>{title}</h2><p>{message}</p>{action && <button className="button primary" onClick={onAction}>{action} <span>→</span></button>}</div>;
}

function AuthPanel({ mode, token }) {
  const { setUser } = useAuth();
  const initialToken = token || (mode === 'verify' ? new URLSearchParams(window.location.search).get('token') || '' : '');
  const [form, setForm] = useState({ name: '', email: '', password: '', token: initialToken });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const copy = { login: ['Welcome back.', 'Sign in to manage your customer stories.'], signup: ['Build your proof library.', 'Create a space and start collecting authentic feedback.'], verify: ['Verify your email.', 'This development flow simulates the verification email.'], forgot: ['Reset your password.', 'Enter your email and we will generate reset instructions.'], reset: ['Choose a new password.', 'Your active sessions will be signed out after reset.'] }[mode];
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    const payload = mode === 'signup' ? { name: form.name, email: form.email, password: form.password } : mode === 'login' ? { email: form.email, password: form.password } : mode === 'verify' ? { token: form.token } : mode === 'forgot' ? { email: form.email } : { token: form.token, password: form.password };
    try {
      const endpoint = mode === 'signup' ? 'signup' : mode === 'login' ? 'login' : mode === 'verify' ? 'verify-email' : mode === 'forgot' ? 'forgot-password' : 'reset-password';
      const data = await apiRequest(`/auth/${endpoint}`, { method: 'POST', body: payload });
      setSuccess(true);
      setMessage(data.verification?.token ? `Simulated verification token: ${data.verification.token}` : data.message);
      if (mode === 'login') { setUser(data.user); window.location.href = '/dashboard'; }
      if (mode === 'signup') {
        const verificationUrl = data.verification?.token ? `/verify-email?token=${encodeURIComponent(data.verification.token)}` : '/verify-email';
        window.location.href = verificationUrl;
      }
      if (mode === 'verify') { setUser(data.user); window.location.href = '/'; }
    } catch (error) { setMessage(error.response?.data?.message || error.message); }
  };
  return <main className="public-shell"><div className="public-card auth-card"><div className="public-brand"><div className="brand-symbol">T</div><strong>TestimonialHub</strong></div><p className="eyebrow">{mode === 'signup' ? 'Start free' : 'Account access'}</p><h1>{copy[0]}</h1><p className="muted">{copy[1]}</p><form className="collect-form" onSubmit={submit}>{mode === 'signup' && <label>Name<input name="name" value={form.name} onChange={update} placeholder="Ava Morgan" required /></label>}{['login', 'signup', 'forgot'].includes(mode) && <label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@company.com" required /></label>}{mode === 'verify' || mode === 'reset' ? <label>Verification / reset token<input name="token" value={form.token} onChange={update} required /></label> : null}{['login', 'signup', 'reset'].includes(mode) && <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" required /></label>}{message && <p className={success ? 'form-success' : 'form-error'} role={success ? 'status' : 'alert'}>{message}</p>}<button className="button primary" type="submit">{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'verify' ? 'Verify email' : mode === 'forgot' ? 'Generate reset link' : 'Reset password'} <span>→</span></button></form><div className="auth-links">{mode !== 'login' && <a href="/login">Sign in</a>}{mode !== 'signup' && <a href="/signup">Create account</a>}{mode !== 'forgot' && <a href="/forgot-password">Forgot password?</a>}</div></div></main>;
}

function PublicCollect({ space }) {
  const questionDefinitions = (space.customQuestions?.length ? space.customQuestions : (space.settings?.customQuestions || [])).map((question, index) => typeof question === 'string' ? { id: `q${index + 1}`, question, required: false } : question);
  const questions = questionDefinitions.map((question) => question.question);
  const avatarEnabled = space.avatarEnabled ?? space.settings?.avatarRequired ?? true;
  const ratingEnabled = space.starRatingEnabled ?? space.settings?.starRatingRequired ?? true;
  const [form, setForm] = useState({ name: '', email: '', role: '', company: '', review: '', rating: 0, customAnswers: {} });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return undefined;
    const redirectTimer = window.setTimeout(() => {
      window.location.assign('/');
    }, 2000);
    return () => window.clearTimeout(redirectTimer);
  }, [sent, space.slug]);
  const [submitting, setSubmitting] = useState(false);
  void submitting;
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const missingQuestion = questionDefinitions.find((question, index) => question.required && !form.customAnswers[index]?.trim());
    if (missingQuestion) { setError(`Please answer: ${missingQuestion.question}`); return; }
    const validation = publicTestimonialSchema.safeParse({ ...form, rating: ratingEnabled ? form.rating : undefined });
    if (!validation.success) { setError(validation.error.issues[0]?.message || 'Please check the form.'); return; }
    setError('');
    const imageError = validateImageFile(avatar);
    if (imageError) { setError(imageError); return; }
    setSubmitting(true);
    try {
      const body = new FormData();
      const submission = { ...form, rating: ratingEnabled ? form.rating : '', customAnswers: questionDefinitions.map((question, index) => ({ questionId: question.id, answer: form.customAnswers[index] || '' })) };
      Object.entries(submission).forEach(([key, value]) => body.append(key, typeof value === 'object' ? JSON.stringify(value) : value));
      if (avatar) body.append('avatar', avatar);
      const response = await fetch(`${API}/testimonials/submit/${space.slug}`, { method: 'POST', body });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Unable to submit testimonial'); }
      setSent(true);
    } catch (submitError) { setError(submitError.message || 'Unable to submit testimonial. Please try again.'); } finally { setSubmitting(false); }
  };

  if (sent) return <main className="public-shell"><div className="public-card success-card"><div className="success-mark">✓</div><p className="eyebrow">Thank you, {form.name.split(' ')[0]}</p><h1>Your story is in good hands.</h1><p className="muted">Your testimonial has been sent to {space.name} for review. We appreciate you taking the time.</p></div></main>;

  return <main className="public-shell"><div className="public-card collect-card"><div className="public-brand">{space.logo ? <img className="public-logo" src={space.logo} alt="" /> : <div className="brand-symbol">T</div>}<span>{space.name}</span></div><p className="eyebrow">A quick favor</p><h1>{space.customPrompt || space.prompt || 'What changed for you?'}</h1><p className="muted">{space.description || 'Your honest experience helps other people make a confident decision.'}</p><form onSubmit={submit} className="collect-form">{ratingEnabled && <label>Your rating<Stars value={form.rating} interactive onChange={(rating) => setForm((current) => ({ ...current, rating }))} /></label>}<div className="form-grid"><label>Name<input name="name" value={form.name} onChange={update} placeholder="Alex Morgan" required /></label><label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="alex@company.com" required /></label></div><div className="form-grid"><label>Role<input name="role" value={form.role} onChange={update} placeholder="Head of Product" /></label><label>Company<input name="company" value={form.company} onChange={update} placeholder="Company name" /></label></div>{avatarEnabled && <label>Avatar<input type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0] || null)} /></label>}<label>Your experience<textarea name="review" value={form.review} onChange={update} placeholder={space.customPrompt || space.prompt} rows="5" required /></label>{questions.map((question, index) => <label key={`${question}-${index}`}>{question}<textarea value={form.customAnswers[index] || ''} onChange={(event) => setForm((current) => ({ ...current, customAnswers: { ...current.customAnswers, [index]: event.target.value } }))} rows="2" /></label>)}{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" type="submit">Send testimonial <span>→</span></button><p className="form-note">By submitting, you give {space.name} permission to display your testimonial.</p></form></div></main>;
}

function PublicWall({ space, testimonials }) {
  const approved = testimonials.filter((review) => review.status === 'approved').sort((a, b) => Number(Boolean(b.isFeatured ?? b.featured)) - Number(Boolean(a.isFeatured ?? a.featured)));
  const brandColor = space.brandColor || '#80A45E';
  return <main className="wall-shell" style={{ '--wall-brand': brandColor }}><header className="wall-header"><div className="public-brand">{space.logo ? <img className="public-logo" src={space.logo} alt="" /> : <div className="brand-symbol">T</div>}<span>{space.name}</span></div><span className="wall-label">Wall of love</span><h1>Kind words from<br /><em>real people.</em></h1><p>{space.description || space.customPrompt}</p><a className="button primary" href={`/collect/${space.slug}`}>Share your story <span>→</span></a></header><section className="wall-grid">{approved.map((review) => <article className={`wall-quote ${review.featured ? 'featured-quote' : ''}`} key={review.id}><div className="quote-top"><Stars value={review.rating} /><span className="quote-date">Verified customer</span></div><p>“{review.review}”</p><footer><Avatar name={review.name} src={review.avatar} /><div><strong>{review.name}</strong><span>{review.role}{review.company ? ` · ${review.company}` : ''}</span></div></footer></article>)}</section><footer className="wall-footer">Collected with <strong>TestimonialHub</strong></footer></main>;
}

function Sidebar({ view, setView, space, owner, pendingCount }) {
  const { user: authOwner } = useAuth();
  const currentOwner = owner || authOwner;
  const items = [['overview', 'Overview'], ['spaces', 'Spaces'], ['inbox', 'Reviews'], ['wall', 'Wall of Love'], ['embed', 'Embed'], ['settings', 'Settings'], ['profile', 'Profile'], ['logout', 'Logout']];
  return <aside className="sidebar"><div className="logo"><div className="brand-symbol">T</div><span>Testimonial<span className="logo-accent">Hub</span></span></div><div className="space-switcher"><Avatar name={space.name} src={space.logo} size="small" /><div><strong>{space.name}</strong><span>Active space</span></div><span className="chevron">⌄</span></div><nav>{items.map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><span className="nav-icon">{id === 'overview' ? '◌' : id === 'inbox' ? '▤' : id === 'wall' ? '♡' : id === 'collect' ? '↗' : '⚙'}</span>{label}{id === 'inbox' && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="upgrade-card"><span className="spark">✦</span><strong>Make your proof<br />impossible to ignore.</strong><button onClick={() => setView('settings')}>Explore widgets <span>→</span></button></div><div className="user-row"><Avatar name={currentOwner?.name} size="small" /><div><strong>{currentOwner?.name || 'Account owner'}</strong><span>{currentOwner?.email || ''}</span></div><button className="dots" aria-label="Account menu">•••</button></div></div></aside>;
}

function StatCard({ label, value, note, accent }) {
  return <div className={`stat-card ${accent}`}><div className="stat-label">{label}<span className="stat-mark">↗</span></div><strong>{value}</strong><span className="stat-note">{note}</span></div>;
}

function StarDistribution({ reviews }) {
  const total = reviews.length;
  return <section className="distribution-card" aria-labelledby="star-distribution-title"><div className="distribution-heading"><div><h2 id="star-distribution-title">Star distribution</h2><p>How approved testimonials are rated.</p></div><strong>{total} total</strong></div><div className="distribution-list">{[5, 4, 3, 2, 1].map((rating) => { const count = reviews.filter((review) => Number(review.rating) === rating).length; const percentage = total ? Math.round((count / total) * 100) : 0; return <div className="distribution-row" key={rating}><span className="distribution-rating">{rating} <span aria-hidden="true">★</span></span><div className="distribution-track"><span style={{ width: `${percentage}%` }} /></div><strong>{count}</strong><span className="distribution-percent">{percentage}%</span></div>; })}</div></section>;
}

function ReviewRow({ review, onModerate: performModeration }) {
  const submittedDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Sep 17, 2026';
  const onModerate = (id, action) => {
    if (!['reject', 'archive', 'delete'].includes(action)) return performModeration(id, action);
    const dialog = document.createElement('dialog');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');
    dialog.innerHTML = `<form method="dialog"><h2 id="confirm-dialog-title">Confirm ${action}</h2><p>This action cannot be easily undone. Do you want to ${action} this testimonial?</p><div class="confirm-dialog-actions"><button value="cancel" class="button secondary">Cancel</button><button value="confirm" class="button primary">${action[0].toUpperCase() + action.slice(1)}</button></div></form>`;
    dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm') performModeration(id, action); dialog.remove(); }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
  };
  return <article className="review-row"><Avatar name={review.name} src={review.avatar} /><div className="review-main"><div className="review-person"><strong>{review.name}</strong><span>{review.email}</span><span className={`status ${review.status}`}>{review.status}</span></div><div className="review-contact"><span>{review.role}{review.company ? ` · ${review.company}` : ''}</span><span>{submittedDate}</span></div><Stars value={review.rating} /><p>{review.review}</p><div className="review-tags"><span>Product experience</span>{review.featured && <span className="featured-state">✦ Featured</span>}{review.liked && <span className="liked-state">♡ Liked</span>}</div></div><div className="review-actions">{review.status === 'pending' && <button title="Approve" aria-label="Approve testimonial" onClick={() => onModerate(review.id, 'approve')} className="approve">✓</button>}{review.status === 'pending' && <button title="Reject" aria-label="Reject testimonial" onClick={() => onModerate(review.id, 'reject')} className="archive">×</button>}<button title="Archive" aria-label="Archive testimonial" onClick={() => onModerate(review.id, 'archive')} className="archive">▣</button><button title={review.liked ? 'Unlike' : 'Like'} aria-label={review.liked ? 'Unlike testimonial' : 'Like testimonial'} onClick={() => onModerate(review.id, review.liked ? 'unlike' : 'like')} className={review.liked ? 'liked' : ''}>♡</button><button title={review.featured ? 'Unfeature' : 'Feature'} aria-label={review.featured ? 'Unfeature testimonial' : 'Feature testimonial'} onClick={() => onModerate(review.id, review.featured ? 'unfeature' : 'feature')} className={review.featured ? 'liked' : ''}>✦</button><button title="More actions" className="dots">•••</button></div></article>;
}

function CollectPanel({ space, onToast }) {
  const url = `${window.location.origin}/collect/${space.slug}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); onToast('Collection link copied.'); } catch { onToast(url); } };
  return <div className="dashboard-view narrow-panel"><div className="page-heading"><div><span className="eyebrow">Collection link</span><h1>Bring the good stories in.</h1><p>Share this link after a win, a launch, or a great customer conversation.</p></div></div><section className="link-panel"><div className="link-preview"><div className="public-brand"><div className="brand-symbol">T</div><span>{space.name}</span></div><h2>{space.prompt}</h2><p>Collect a thoughtful testimonial in under two minutes.</p><div className="fake-input">Your name</div><div className="fake-textarea">Tell us about your experience...</div><button type="button" className="button primary" onClick={() => window.open(`/collect/${space.slug}`, '_blank')}>Send testimonial <span>→</span></button></div><div className="link-details"><span className="eyebrow">Your public link</span><div className="url-box">{url}<button onClick={copy} aria-label="Copy collection link">⧉</button></div><button className="button secondary" onClick={() => window.open(`/collect/${space.slug}`, '_blank')}>Preview collection page <span>↗</span></button><div className="share-note"><span>✦</span><div><strong>Tip for more responses</strong><p>Send this within 24 hours of a customer sharing a positive result.</p></div></div></div></section></div>;
}

function SettingsPanel({ space, onToast }) {
  const [form, setForm] = useState({ name: space.name, slug: space.slug, customPrompt: space.customPrompt || space.prompt, description: space.description, brandColor: space.brandColor || '#A8C96F', avatarEnabled: space.avatarEnabled !== false, starRatingEnabled: space.starRatingEnabled !== false, customQuestions: space.customQuestions?.length ? space.customQuestions : ['What did you like most about our service?'] });
  const [logo, setLogo] = useState(null);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateQuestion = (index, value) => setForm((current) => ({ ...current, customQuestions: current.customQuestions.map((question, questionIndex) => questionIndex === index ? value : question) }));
  const save = async (event) => { event.preventDefault(); const validation = spaceSchema.safeParse(form); if (!validation.success) { onToast(validation.error.issues[0]?.message || 'Please check the form.'); return; } try { const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, Array.isArray(value) ? JSON.stringify(value) : value)); if (logo) body.append('logo', logo); await apiRequest(`/spaces/${space.id}`, { method: 'PATCH', body }); onToast('Space settings saved.'); } catch (error) { onToast(error.response?.data?.message || error.message); } };
  return <div className="dashboard-view settings-layout"><div className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Space settings</h1><p>Shape the experience customers see when they share a story.</p></div></div><div className="settings-columns"><form className="settings-form" onSubmit={save}><label>Business / Space Name<input name="name" value={form.name} onChange={update} required /></label><label>Slug<input name="slug" value={form.slug} onChange={update} pattern="[a-zA-Z0-9-]+" required /><span className="field-help">Public URL: /collect/{form.slug || 'your-space'}</span></label><label>Logo<input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] || null)} /></label><label>Custom Prompt<textarea name="customPrompt" value={form.customPrompt} onChange={update} rows="3" /></label><label>Brand Color<input name="brandColor" type="color" value={form.brandColor} onChange={update} /></label><div className="settings-row"><div><strong>Enable Avatar</strong><span>Let customers add a profile image.</span></div><input type="checkbox" checked={form.avatarEnabled} onChange={(event) => setForm((current) => ({ ...current, avatarEnabled: event.target.checked }))} /></div><div className="settings-row"><div><strong>Enable Star Rating</strong><span>Ask customers to rate their experience.</span></div><input type="checkbox" checked={form.starRatingEnabled} onChange={(event) => setForm((current) => ({ ...current, starRatingEnabled: event.target.checked }))} /></div><div className="question-editor"><strong>Custom questions</strong>{form.customQuestions.map((question, index) => <div className="question-row" key={`${index}-${question}`}><input value={question} onChange={(event) => updateQuestion(index, event.target.value)} placeholder="What did you like most about our service?" /><button type="button" className="dots" onClick={() => setForm((current) => ({ ...current, customQuestions: current.customQuestions.filter((_, questionIndex) => questionIndex !== index) }))} aria-label="Remove question">×</button></div>)}<button type="button" className="text-button" onClick={() => setForm((current) => ({ ...current, customQuestions: [...current.customQuestions, ''] }))}>+ Add custom question</button></div><button className="button primary" type="submit">Save changes <span>✓</span></button></form><aside className="settings-preview" style={{ '--preview-brand': form.brandColor }}><span className="eyebrow">Live preview</span><div className="preview-brand"><div className="brand-symbol">T</div><strong>{form.name || 'Your business'}</strong></div><h2>{form.customPrompt || 'What changed for you?'}</h2><p>{form.description || 'Your customer story helps others make a confident decision.'}</p>{form.starRatingEnabled && <Stars value={5} />}<div className="preview-field">Your name</div><div className="preview-field preview-message">Tell us about your experience...</div><button type="button" className="button primary" onClick={() => window.open(`/collect/${form.slug}`, '_blank')}>Send testimonial <span>→</span></button></aside></div></div>;
}

function CreateSpacePanel({ onCreated }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '', customPrompt: '', brandColor: '#A8C96F', avatarEnabled: true, starRatingEnabled: true, customQuestions: ['What did you like most about our service?'] });
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const update = (event) => setForm((current) => {
    const next = { ...current, [event.target.name]: event.target.value };
    if (event.target.name === 'name' && !slugEdited) next.slug = slugify(event.target.value);
    if (event.target.name === 'slug') setSlugEdited(true);
    return next;
  });
  const submit = async (event) => {
    event.preventDefault();
    const validation = spaceSchema.safeParse(form);
    if (!validation.success) { setMessage(validation.error.issues[0]?.message || 'Please check the form.'); return; }
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, Array.isArray(value) ? JSON.stringify(value) : value));
      if (logo) body.append('logo', logo);
      const data = await apiRequest('/spaces/create', { method: 'POST', body });
      onCreated(data.space);
    } catch (error) { setMessage(error.message); }
  };
  const updateQuestion = (index, value) => setForm((current) => ({ ...current, customQuestions: current.customQuestions.map((question, questionIndex) => questionIndex === index ? value : question) }));
  return <div className="dashboard-view narrow-panel"><div className="page-heading"><div><span className="eyebrow">New space</span><h1>Create a branded collection.</h1><p>Give this testimonial page its own voice, prompt, and public URL.</p></div></div><form className="settings-form" onSubmit={submit}><label>Business / Space Name<input name="name" value={form.name} onChange={update} placeholder="Acme Corp" required /></label><label>Slug<input name="slug" value={form.slug} onChange={update} placeholder="acme-corp" pattern="[a-zA-Z0-9-]+" required /><span className="field-help">Lowercase letters, numbers, and hyphens only.</span></label><label>Description<textarea name="description" value={form.description} onChange={update} placeholder="A short introduction for customers." rows="3" /></label><label>Logo<input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] || null)} /></label><label>Custom Prompt<textarea name="customPrompt" value={form.customPrompt} onChange={update} placeholder="What did you like most about our service?" rows="3" /></label><label>Brand Color<input name="brandColor" type="color" value={form.brandColor} onChange={update} /></label><div className="settings-row"><div><strong>Enable Avatar</strong><span>Let customers add a profile image.</span></div><input type="checkbox" checked={form.avatarEnabled} onChange={(event) => setForm((current) => ({ ...current, avatarEnabled: event.target.checked }))} /></div><div className="settings-row"><div><strong>Enable Star Rating</strong><span>Ask customers to rate their experience.</span></div><input type="checkbox" checked={form.starRatingEnabled} onChange={(event) => setForm((current) => ({ ...current, starRatingEnabled: event.target.checked }))} /></div><div className="question-editor"><strong>Custom questions</strong>{form.customQuestions.map((question, index) => <div className="question-row" key={`${index}-${question}`}><input value={question} onChange={(event) => updateQuestion(index, event.target.value)} placeholder="What did you like most about our service?" /><button type="button" className="dots" onClick={() => setForm((current) => ({ ...current, customQuestions: current.customQuestions.filter((_, questionIndex) => questionIndex !== index) }))} aria-label="Remove question">×</button></div>)}<button type="button" className="text-button" onClick={() => setForm((current) => ({ ...current, customQuestions: [...current.customQuestions, ''] }))}>+ Add custom question</button></div>{message && <p className="form-error" role="alert">{message}</p>}<button className="button primary" type="submit">Create space <span>→</span></button></form></div>;
}

function SpacesPanel({ space, testimonials, onCreate }) {
  const averageRating = testimonials.length ? (testimonials.reduce((sum, review) => sum + Number(review.rating || 0), 0) / testimonials.length).toFixed(1) : '0.0';
  const openRoute = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };
  if (!space) return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Your spaces</h1></div></div><EmptyState title="You haven't created a Space yet." message="Create your first Space to start collecting testimonials." action="Create your first Space" onAction={onCreate} /></div>;
  return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Your spaces</h1><p>Keep each brand, product, or campaign’s social proof in its own home.</p></div><button className="button primary" onClick={onCreate}>Create space <span>+</span></button></div><article className="space-card"><div className="space-card-main"><div className="space-logo">{space.logo ? <img src={space.logo} alt="" /> : <span className="brand-symbol">T</span>}</div><div><h2>{space.name}</h2><span className="space-slug">/{space.slug}</span></div><span className="space-status">Active</span></div><div className="space-card-stats"><div><span>Review count</span><strong>{testimonials.length}</strong></div><div><span>Average rating</span><strong>{averageRating} <small>★</small></strong></div></div><div className="space-card-actions"><a className="button secondary" href={`/collect/${space.slug}`}>Open Collection Page <span>↗</span></a><a className="button secondary" href={`/wall/${space.slug}`}>Open Wall <span>↗</span></a><button className="button primary" onClick={() => openRoute(`/dashboard/spaces/${space.id}/settings`)}>Manage <span>→</span></button></div></article></div>;
}

function EmbeddedWidget({ spaceSlug }) {
  const params = new URLSearchParams(window.location.search);
  const [testimonials, setTestimonials] = useState([]);
  const layout = params.get('layout') || 'grid';
  const theme = params.get('theme') || 'light';
  const count = Math.min(24, Math.max(1, Number(params.get('count') || 6)));
  const showRatings = params.get('showRatings') !== 'false';
  const showAvatars = params.get('showAvatars') !== 'false';
  const featuredOnly = params.get('featuredOnly') === 'true';
  useEffect(() => {
    fetch(`${API}/public/spaces/${encodeURIComponent(spaceSlug)}/testimonials/approved`)
      .then((response) => response.json())
      .then((data) => setTestimonials(data.testimonials || []))
      .catch(() => setTestimonials([]));
  }, [spaceSlug]);
  const visible = testimonials.filter((item) => !featuredOnly || item.featured).slice(0, count);
  return <main className={`embed-frame embed-${theme}`}><div className={`embed-reviews embed-${layout}`}>{visible.map((review) => <article className="embed-review" key={review.id}>{showRatings && <Stars value={review.rating} />}<p>{review.review}</p><footer>{showAvatars && review.avatar && <img src={review.avatar} alt="" />}<span><strong>{review.name}</strong><small>{review.role}{review.company ? ` · ${review.company}` : ''}</small></span></footer></article>)}</div></main>;
}

function EmbedPanelRedesigned({ space }) {
  const [options, setOptions] = useState({ theme: 'light', layout: 'grid', showRatings: true, showAvatars: true, featuredOnly: false, count: 6 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const update = (event) => setOptions((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  useEffect(() => {
    let active = true;
    apiRequest(`/spaces/${space.id}/embed`).then((data) => {
      if (active && data.embedSettings) setOptions((current) => ({ ...current, ...data.embedSettings }));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [space.id]);
  useEffect(() => {
    if (loading) return undefined;
    const timer = window.setTimeout(() => {
      apiRequest(`/spaces/${space.id}/embed`, { method: 'PATCH', body: { ...options, count: Number(options.count) } }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loading, options, space.id]);
  const embedUrl = window.location.origin + '/embed/' + space.slug + '?' + new URLSearchParams({ ...options, count: String(options.count) }).toString();
  const snippet = '<iframe\n  src="' + embedUrl + '"\n  title="' + space.name + ' testimonials"\n  loading="lazy"\n  style="width:100%;min-height:360px;border:0"\n></iframe>';
  const copySnippet = async () => { try { await navigator.clipboard.writeText(snippet); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); } };
  return <div className="dashboard-view embed-dashboard"><div className="page-heading embed-heading"><div><span className="eyebrow">Embed generator</span><h1>Share your best customer stories.</h1><p>Build a widget that feels at home on your website.</p></div><span className="embed-save-status">{loading ? 'Loading saved settings…' : 'Saved automatically'}</span></div><div className="embed-layout"><section className="embed-settings-card"><div className="embed-card-heading"><div><span className="eyebrow">Widget settings</span><h2>Make it yours</h2></div><span className="embed-settings-icon">✦</span></div><div className="embed-form-grid"><label>Theme<select name="theme" value={options.theme} onChange={update}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label><label>Layout<select name="layout" value={options.layout} onChange={update}><option value="grid">Grid</option><option value="carousel">Carousel</option><option value="badge">Badge</option></select></label><label>Number of testimonials<input name="count" type="number" min="1" max="24" value={options.count} onChange={update} /></label></div><div className="embed-toggle-list"><label><span><strong>Show ratings</strong><small>Display the star rating with each story.</small></span><input name="showRatings" type="checkbox" checked={options.showRatings} onChange={update} /></label><label><span><strong>Show avatars</strong><small>Include customer profile images.</small></span><input name="showAvatars" type="checkbox" checked={options.showAvatars} onChange={update} /></label><label><span><strong>Featured only</strong><small>Only display stories you have featured.</small></span><input name="featuredOnly" type="checkbox" checked={options.featuredOnly} onChange={update} /></label></div><p className="embed-settings-note">Your changes are saved automatically and reflected in the preview.</p></section><section className="embed-output-card"><div className="embed-output-heading"><div><span className="eyebrow">Live preview</span><h2>See it in context</h2></div><span className="embed-layout-pill">{options.layout}</span></div><div className="embed-preview-shell"><iframe title="Testimonial preview" src={embedUrl} /></div><div className="embed-code-heading"><div><span className="eyebrow">Ready to publish</span><p>Paste this iframe into any HTML page.</p></div><Button onClick={copySnippet}>{copied ? 'Copied' : 'Copy code'} <span>⧉</span></Button></div><pre className="embed-code">{snippet}</pre></section></div></div>;
}

function EmbedPanel({ space }) {
  const [options, setOptions] = useState({ theme: 'light', layout: 'grid', showRatings: true, showAvatars: true, featuredOnly: false, count: 6 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const update = (event) => setOptions((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  useEffect(() => {
    let active = true;
    apiRequest(`/spaces/${space.id}/embed`).then((data) => {
      if (active && data.embedSettings) setOptions((current) => ({ ...current, ...data.embedSettings }));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [space.id]);
  useEffect(() => {
    if (loading) return undefined;
    const timer = window.setTimeout(() => {
      apiRequest(`/spaces/${space.id}/embed`, { method: 'PATCH', body: { ...options, count: Number(options.count) } }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loading, options, space.id]);
  const embedUrl = `${window.location.origin}/embed/${space.slug}?${new URLSearchParams({ ...options, count: String(options.count) }).toString()}`;
  const snippet = `<iframe\n  src="${embedUrl}"\n  title="${space.name} testimonials"\n  loading="lazy"\n  style="width:100%;min-height:360px;border:0"\n></iframe>`;
  const copySnippet = async () => { try { await navigator.clipboard.writeText(snippet); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); } };
  return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">Embed generator</span><h1>Put your best stories where they matter.</h1><p>Configure and copy a self-contained testimonial iframe.</p></div><Dialog><DialogTrigger render={<Button>Open generator</Button>} /><DialogPopup><DialogHeader><DialogTitle>Embed generator</DialogTitle><DialogDescription>Choose how approved testimonials should appear on your website.</DialogDescription></DialogHeader><div className="embed-modal-options"><label>Theme<select name="theme" value={options.theme} onChange={update}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label><label>Layout<select name="layout" value={options.layout} onChange={update}><option value="grid">Grid</option><option value="carousel">Carousel</option><option value="badge">Badge</option></select></label><label>Number of testimonials<input name="count" type="number" min="1" max="24" value={options.count} onChange={update} /></label><label><input name="showRatings" type="checkbox" checked={options.showRatings} onChange={update} /> Show ratings</label><label><input name="showAvatars" type="checkbox" checked={options.showAvatars} onChange={update} /> Show avatars</label><label><input name="featuredOnly" type="checkbox" checked={options.featuredOnly} onChange={update} /> Featured only</label></div><DialogFooter><DialogClose render={<Button variant="outline">Done</Button>} /></DialogFooter></DialogPopup></Dialog></div><section className="embed-builder"><div className="embed-output"><span className="eyebrow">Iframe snippet</span><pre className="embed-code">{snippet}</pre><Button onClick={copySnippet}>{copied ? 'Copied' : 'Copy iframe code'} <span>⧉</span></Button><iframe title="Testimonial preview" src={embedUrl} style={{ width: '100%', minHeight: 260, border: 0, marginTop: 20 }} /></div></section></div>;
}

function LegacyEmbedPanel({ space }) {
  const [options, setOptions] = useState({ theme: 'light', layout: 'grid', showRatings: true, showAvatars: true, featuredOnly: false, count: 6 });
  const [copied, setCopied] = useState(false);
  const update = (event) => setOptions((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const embedUrl = `${window.location.origin}/embed/${space.slug}?${new URLSearchParams({ ...options, count: String(options.count) }).toString()}`;
  const snippet = `<iframe\n  src="${embedUrl}"\n  title="${space.name} testimonials"\n  loading="lazy"\n  style="width:100%;min-height:360px;border:0"\n></iframe>`;
  const copySnippet = async () => { try { await navigator.clipboard.writeText(snippet); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); } };
  return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">Embed generator</span><h1>Put your best stories where they matter.</h1><p>Configure a testimonial widget and copy it into your website.</p></div></div><section className="embed-builder"><form className="settings-form embed-options"><label>Theme<select name="theme" value={options.theme} onChange={update}><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label><label>Layout<select name="layout" value={options.layout} onChange={update}><option value="grid">Grid</option><option value="carousel">Carousel</option><option value="badge">Badge</option></select></label><label>Number of testimonials<input name="count" type="number" min="1" max="24" value={options.count} onChange={update} /></label><div className="settings-row"><div><strong>Show ratings</strong><span>Display customer star ratings.</span></div><input name="showRatings" type="checkbox" checked={options.showRatings} onChange={update} /></div><div className="settings-row"><div><strong>Show avatars</strong><span>Display customer profile images.</span></div><input name="showAvatars" type="checkbox" checked={options.showAvatars} onChange={update} /></div><div className="settings-row"><div><strong>Show featured only</strong><span>Only include stories selected for your wall.</span></div><input name="featuredOnly" type="checkbox" checked={options.featuredOnly} onChange={update} /></div></form><div className="embed-output"><span className="eyebrow">Generated snippet</span><pre className="embed-code">{snippet}</pre><button type="button" className="button primary" onClick={copySnippet}>Copy Embed Code <span>⧉</span></button>{copied && <div className="toast" role="status">Embed code copied to clipboard.</div>}<div className={`embed-preview ${options.theme}`}><div className="public-brand"><div className="brand-symbol">T</div><span>{space.name}</span></div><h2>{options.layout === 'badge' ? 'Trusted by customers' : options.layout === 'carousel' ? 'What customers are saying' : 'Loved by teams who care about the details.'}</h2><p>{options.count} {options.featuredOnly ? 'featured ' : ''}testimonials · {options.layout} layout</p></div></div></section></div>;
}

function Dashboard({ space, testimonials, setTestimonials, view, setView, owner }) {
  const { user: authOwner } = useAuth();
  const currentOwner = owner || authOwner;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [toast, setToast] = useState('');
  const approved = testimonials.filter((item) => item.status === 'approved');
  const visible = useMemo(() => testimonials.filter((item) => (filter === 'all' || item.status === filter) && (ratingFilter === 'all' || Number(item.rating) === Number(ratingFilter)) && `${item.name} ${item.review} ${item.company}`.toLowerCase().includes(query.toLowerCase())), [testimonials, filter, ratingFilter, query]);
  const average = approved.length ? (approved.reduce((sum, item) => sum + item.rating, 0) / approved.length).toFixed(1) : '0.0';
  const moderate = async (id, action, featured) => {
    setTestimonials((current) => current.map((item) => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'archive' ? 'archived' : item.status, featured: action === 'feature' ? true : action === 'unfeature' ? false : item.featured, liked: action === 'like' ? true : action === 'unlike' ? false : item.liked, isLiked: action === 'like' ? true : action === 'unlike' ? false : item.isLiked } : item));
    try { await apiRequest(`/testimonials/${id}/moderate`, { method: 'PATCH', body: { action, featured } }); } catch { /* Keep the optimistic row update until the next refresh. */ }
    setToast(action === 'approve' ? 'Testimonial approved.' : action === 'reject' ? 'Testimonial rejected.' : action === 'archive' ? 'Testimonial archived.' : 'Review updated.');
    window.setTimeout(() => setToast(''), 2400);
  };
  if ((view === 'overview' || view === 'inbox') && testimonials.length === 0) return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">{view === 'inbox' ? 'Review queue' : 'Workspace'}</span><h1>{view === 'inbox' ? 'Your inbox' : 'Overview'}</h1><p>Build your collection of customer stories.</p></div><button className="button primary" onClick={() => setView('collect')}>Get testimonials <span>↗</span></button></div><EmptyState title="No testimonials yet." message="Share your collection link to start receiving feedback." action="Open collection link" onAction={() => setView('collect')} /></div>;
  if (view === 'collect') return <CollectPanel space={space} onToast={setToast} />;
  if (view === 'new') return <CreateSpacePanel onCreated={(createdSpace) => { setView('overview'); window.location.href = `/dashboard/spaces/${createdSpace.id}`; }} />;
  if (view === 'spaces') return <SpacesPanel space={space} testimonials={testimonials} onCreate={() => setView('new')} />;
  if (view === 'embed') return <EmbedPanelRedesigned space={space} />;
  if (view === 'profile') return <SettingsPanel space={space} onToast={setToast} />;
  if (view === 'settings') return <SettingsPanel space={space} onToast={setToast} />;
  if (view === 'wall') return <div className="dashboard-view"><div className="page-heading"><div><span className="eyebrow">Public experience</span><h1>Wall of Love</h1><p>Approved testimonials, ready to share with the world.</p></div><a className="button primary" href={`/wall/${space.slug}`}>Open public wall <span>↗</span></a></div><div className="wall-preview-grid">{approved.map((review) => <div className="mini-quote" key={review.id}><Stars value={review.rating} /><p>“{review.review}”</p><strong>{review.name}</strong><span>{review.role}</span></div>)}</div></div>;
  return <DashboardOverview testimonials={testimonials} view={view} setView={setView} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} ratingFilter={ratingFilter} setRatingFilter={setRatingFilter} visible={visible} moderate={moderate} toast={toast} average={average} approved={approved} currentOwner={currentOwner} />;
}

function DashboardOverview({ testimonials, view, setView, query, setQuery, filter, setFilter, ratingFilter, setRatingFilter, visible, moderate, toast, average, approved, currentOwner }) {
  return <div className="dashboard-view">
    <div className="page-heading"><div><span className="eyebrow">{view === 'inbox' ? 'Review queue' : 'Workspace'}</span><h1>{view === 'inbox' ? 'Your inbox' : `Good morning, ${currentOwner?.name?.split(' ')[0] || 'there'}.`}</h1><p>{view === 'inbox' ? 'Turn great customer stories into your best marketing asset.' : 'Here is what is happening with your social proof.'}</p></div><button className="button primary" onClick={() => setView('collect')}>Get testimonials <span>↗</span></button></div>
    {view === 'overview' && <><div className="stats-grid"><StatCard label="Average rating" value={average} note={approved.length ? 'Based on approved stories' : 'No approved stories yet'} accent="yellow" /><StatCard label="Total testimonials" value={testimonials.length} note={testimonials.length ? 'All submitted stories' : 'No stories yet'} accent="coral" /><StatCard label="Featured stories" value={testimonials.filter((item) => item.featured).length} note="Selected for your wall" accent="blue" /><StatCard label="Response rate" value="—" note="Not tracked yet" accent="green" /></div><StarDistribution reviews={approved} /></>}
    <section className="inbox-section"><div className="section-heading"><div><h2>{view === 'inbox' ? 'All testimonials' : 'Needs your attention'}</h2><p>{view === 'inbox' ? `${testimonials.length} stories in your collection` : 'Review, tag, and publish the latest customer stories.'}</p></div>{view === 'overview' && <button className="text-button" onClick={() => setView('inbox')}>View all <span>→</span></button>}</div>
      <div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search testimonials..." /></div><div className="filter-tabs">{['all', 'pending', 'approved', 'archived'].map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'selected' : ''}>{item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}</button>)}</div><label className="rating-filter"><span>Rating</span><select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} aria-label="Filter by rating"><option value="all">All ratings</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label></div>
      <div className="review-list">{visible.map((review) => <ReviewRow key={review.id} review={review} onModerate={moderate} />)}{visible.length === 0 && <div className="empty-state">No testimonials match this filter.</div>}</div>
    </section><Toast message={toast} />
  </div>;
}

const dashboardViewFromPath = (path) => {
  if (path[0] !== 'dashboard') return 'overview';
  if (path[1] === 'spaces' && path[2] === 'new') return 'new';
  if (path[1] === 'spaces' && path[3] === 'wall') return 'wall';
  if (path[1] === 'spaces' && path[3] === 'reviews') return 'inbox';
  if (path[1] === 'spaces' && path[3] === 'embed') return 'embed';
  if (path[1] === 'spaces' && path[3] === 'settings') return 'settings';
  if (path[1] === 'spaces' && path[2]) return 'overview';
  if (path[1] === 'spaces') return 'spaces';
  if (path[1] === 'profile') return 'profile';
  return 'overview';
};

function App() {
  const route = resolveRoute(window.location.pathname);
  const path = route.segments;
  const publicMode = path[0] === 'collect' || path[0] === 'wall' || path[0] === 'embed';
  const routeSlug = path[1] || '';
  const authMode = ['login', 'signup', 'verify-email', 'forgot-password', 'reset-password'].includes(route.name);
  const [space, setSpace] = useState(publicMode && routeSlug === 'acme' ? demoSpace : null);
  const [testimonials, setTestimonials] = useState(publicMode && routeSlug === 'acme' ? demoTestimonials : []);
  const [authReady, setAuthReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const { setUser } = useAuth();
  const [view, setViewState] = useState(() => dashboardViewFromPath(path));
  const setView = (nextView) => {
    if (nextView === 'logout') {
      fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).finally(() => { window.location.href = '/dashboard'; });
      return;
    }
    const routeMap = { overview: '/dashboard', spaces: '/dashboard/spaces', new: '/dashboard/spaces/new', profile: '/dashboard/profile' }; if (space) Object.assign(routeMap, { inbox: `/dashboard/spaces/${space.id}/reviews`, wall: `/dashboard/spaces/${space.id}/wall`, embed: `/dashboard/spaces/${space.id}/embed`, settings: `/dashboard/spaces/${space.id}/settings`, collect: `/collect/${space.slug}` });
    const nextPath = routeMap[nextView] || '/dashboard';
    window.history.pushState({}, '', nextPath);
    setViewState(nextView);
  };
  useEffect(() => {
    const handlePopState = () => setViewState(dashboardViewFromPath(window.location.pathname.split('/').filter(Boolean)));
    const mobileMenuButton = document.querySelector('.mobile-header .icon-button');
    const sidebar = document.querySelector('.sidebar');
    const toggleMobileNav = () => { const open = sidebar?.classList.toggle('drawer-open'); mobileMenuButton?.setAttribute('aria-expanded', String(Boolean(open))); if (open) sidebar?.querySelector('nav button')?.focus(); };
    const closeMobileNav = (event) => { if (event.target.closest('.sidebar nav button')) { sidebar?.classList.remove('drawer-open'); mobileMenuButton?.setAttribute('aria-expanded', 'false'); mobileMenuButton?.focus(); } };
    const closeOnEscape = (event) => { if (event.key === 'Escape' && sidebar?.classList.contains('drawer-open')) { sidebar.classList.remove('drawer-open'); mobileMenuButton?.setAttribute('aria-expanded', 'false'); mobileMenuButton?.focus(); } };
    window.addEventListener('popstate', handlePopState);
    mobileMenuButton?.setAttribute('aria-expanded', 'false');
    mobileMenuButton?.setAttribute('aria-controls', 'dashboard-navigation');
    sidebar?.setAttribute('id', 'dashboard-navigation');
    document.querySelectorAll('.review-actions .dots').forEach((button) => button.setAttribute('aria-label', 'More testimonial actions'));
    document.querySelectorAll('.toolbar .icon-button').forEach((button) => button.setAttribute('aria-label', 'Filter testimonials'));
    mobileMenuButton?.addEventListener('click', toggleMobileNav);
    sidebar?.addEventListener('click', closeMobileNav);
    document.addEventListener('keydown', closeOnEscape);
    const load = async () => {
      if (authMode || route.name === 'not-found') return;
      if (route.name === 'home') {
        try { const data = await apiRequest('/auth/me'); setUser(data.user); } catch { /* Public visitors can browse without signing in. */ } finally { setAuthReady(true); }
        return;
      }
      if (!publicMode) {
        try { const data = await apiRequest('/auth/me'); setUser(data.user); setAuthReady(true); } catch { window.location.assign(ROUTES.login); return; }
      }
      try {
        const spaceResponse = await fetch(`${API}/spaces/public/${routeSlug}`);
        if (publicMode && spaceResponse.ok) { const data = await spaceResponse.json(); setSpace(data.space); }
        if (!publicMode) {
          const [spacesData, inboxData] = await Promise.all([apiRequest('/spaces/mine'), apiRequest('/testimonials/inbox')]);
          if (spacesData.spaces?.[0]) setSpace(spacesData.spaces[0]);
          if (inboxData.reviews) setTestimonials(inboxData.reviews);
        } else {
          const wallResponse = await fetch(`${API}/spaces/public/${routeSlug}/wall`);
          if (wallResponse.ok) { const data = await wallResponse.json(); if (data.testimonials) setTestimonials(data.testimonials); }
        }
      } catch { /* Keep dashboard data-driven when an API request fails. */ } finally { setDataReady(true); }
    };
    load();
    return () => { window.removeEventListener('popstate', handlePopState); mobileMenuButton?.removeEventListener('click', toggleMobileNav); sidebar?.removeEventListener('click', closeMobileNav); document.removeEventListener('keydown', closeOnEscape); };
  }, [authMode, publicMode, route.name, routeSlug, setUser]);
  if (route.name === 'home') return <HomePage />;
  if (authMode) return <AuthPanel mode={route.name === 'reset-password' ? 'reset' : route.name === 'verify-email' ? 'verify' : route.name === 'forgot-password' ? 'forgot' : route.name} token={route.name === 'reset-password' ? path[1] : ''} />;
  if (publicMode && !dataReady) return <main className="public-shell"><div className="public-card success-card"><p className="eyebrow">Loading space</p><h1>Preparing your page...</h1><p className="muted">Please wait while we load the latest space content.</p></div></main>;
  if (publicMode && !space) return <main className="public-shell"><div className="public-card success-card"><span className="eyebrow">404</span><h1>Space not found.</h1><p className="muted">This public link does not match an existing space.</p><a className="button primary" href={ROUTES.home}>Back to home <span>→</span></a></div></main>;
  if (publicMode) return path[0] === 'collect' ? <PublicCollect space={space} /> : path[0] === 'wall' ? <PublicWall space={space} testimonials={testimonials} /> : <EmbeddedWidget spaceSlug={routeSlug} />;
  if (route.name === 'not-found') return <main className="public-shell"><div className="public-card success-card"><span className="eyebrow">404</span><h1>That page wandered off.</h1><p className="muted">The link you followed does not match a TestimonialHub route.</p><a className="button primary" href={ROUTES.home}>Back to home <span>→</span></a></div></main>;
  if (!authReady || !dataReady) return <main className="public-shell"><div className="public-card success-card"><p className="eyebrow">Account access</p><h1>Loading your workspace...</h1><p className="muted">Please wait while we load your real spaces and testimonials.</p></div></main>;
  if (!space && view === 'new') return <main className="main-content"><Dashboard space={null} testimonials={testimonials} setTestimonials={setTestimonials} view={view} setView={setView} /></main>;
  if (!space) return <main className="public-shell"><div className="public-card success-card"><p className="eyebrow">Workspace</p><h1>Create your first space.</h1><p className="muted">Your account is ready. Create a space to start collecting testimonials.</p><a className="button primary" href={ROUTES.newSpace}>Create space <span>→</span></a></div></main>;
  return <div className="app-shell"><Sidebar view={view} setView={setView} space={space} /><main className="main-content"><header className="mobile-header"><div className="logo"><div className="brand-symbol">T</div><span>Testimonial<span className="logo-accent">Hub</span></span></div><button className="icon-button" aria-label="Open navigation">☰</button></header><Dashboard space={space} testimonials={testimonials} setTestimonials={setTestimonials} view={view} setView={setView} /></main></div>;
}

export default App;
