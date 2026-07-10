import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetching metrics dynamically from Supabase
        const { data: dbData, error: dbError } = await supabase
          .from('dashboard_metrics')
          .select('*');

        if (dbError) throw dbError;
        if (dbData) setData(dbData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err.message);
        setError('Failed to load real-time metrics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="page">
      <div className="page-inner">
        
        {/* HEADER */}
        <div className="identify-header">
          <h1>Your Environmental Impact Dashboard</h1>
          <p>Track your recycle metrics and points progression in real time</p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="dash-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner">🔄 Loading Dashboard Metrics...</div>
          </div>
        )}

        {/* ERROR FALLBACK STATE */}
        {error && !loading && (
          <div className="result-card" style={{ borderColor: '#ef4444' }}>
            <div className="result-title" style={{ color: '#ef4444' }}>⚠️ System Warning</div>
            <p>{error}</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              Displaying temporary cached data. Make sure Arbit has configured 'dashboard_metrics' table.
            </p>
          </div>
        )}

        {/* METRICS GRID RENDERING */}
        {!loading && (
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {data.length === 0 ? (
              <div className="dash-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <h3>No metrics discovered yet.</h3>
                <p>Head over to the Identify Hub and scan an item to earn your first points!</p>
              </div>
            ) : (
              data.map((item, index) => (
                <div className="dash-card" key={item.id || index} style={{ borderLeft: '5px solid #22c55e' }}>
                  <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold' }}>
                    {item.title || 'Metric'}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '5px' }}>
                    {item.value || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}