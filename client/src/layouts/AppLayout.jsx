export default function AppLayout({ sidebar, children }) {
  return (
    <div className="app-shell">
      {sidebar}
      <main className="main-content">{children}</main>
    </div>
  );
}
