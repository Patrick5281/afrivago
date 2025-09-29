import React, { useEffect, useState } from 'react';
import FavorisView from './favoris.view';

const FavorisContainer = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      });
  }, []);

  return <FavorisView properties={properties} loading={loading} />;
};

export default FavorisContainer;



