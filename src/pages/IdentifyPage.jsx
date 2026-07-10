import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function IdentifyPage() {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIdentify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assumes you have an 'identified_items' table in Supabase
      const { data, error } = await supabase
        .from('identified_items')
        .insert([{ item_name: itemName, category: category }]);

      if (error) throw error;

      alert('Item successfully saved to Supabase!');
      setItemName('');
      setCategory('');
    } catch (error) {
      console.error('Error saving item:', error.message);
      alert('Failed to save item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Identify & Log New Item</h2>
      <form onSubmit={handleIdentify}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Item Name:</label>
          <input 
            type="text" 
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Category:</label>
          <input 
            type="text" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Saving to Database...' : 'Identify & Save'}
        </button>
      </form>
    </div>
  );
}
