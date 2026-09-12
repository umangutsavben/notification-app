export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard Overview</h1>
      <p>Welcome to the Notification Platform Admin Dashboard.</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Total Users</h3>
          <p>--</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Notifications Sent</h3>
          <p>--</p>
        </div>
      </div>
    </div>
  );
}
