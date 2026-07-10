import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Assumes you have a table named 'dashboard_metrics' or similar in Supabase
        const { data: dbData, error } = await supabase
          .from('dashboard_metrics')
          .select('*');

        if (error) throw error;
        if (dbData) setData(dbData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Dashboard</h2>
      {data.length === 0 ? (
        <p>No metrics found. Start by adding some data!</p>
      ) : (
        <ul>
          {data.map((item, index) => (
            <li key={item.id || index}>
              {item.title || 'Metric'}: {item.value || 0}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
