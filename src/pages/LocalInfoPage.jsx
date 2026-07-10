import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LocalInfoPage() {
  const [infoList, setInfoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocalInfo() {
      try {
        setLoading(true);
        // Assumes you have a 'local_info' or 'guidelines' table in Supabase
        const { data, error } = await supabase
          .from('local_info')
          .select('*');

        if (error) throw error;
        if (data) setInfoList(data);
      } catch (error) {
        console.error('Error fetching local info:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLocalInfo();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Local Information...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>Local Guidelines & Resources</h2>
      {infoList.length === 0 ? (
        <p>No regional information available at the moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          {infoList.map((info, index) => (
            <div key={info.id || index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
              <h3>{info.title || 'General Guideline'}</h3>
              <p>{info.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
