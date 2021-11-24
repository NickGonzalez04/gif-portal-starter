import React, { useState,  useEffect} from 'react';
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'

// Giphy API call
const gf = new GiphyFetch('BPkoNTFx7Fk0AGoSR67KJWbZksFRTK5J')


// Render gif grid upon search
const GifGrid = ({ input }) => {
    console.log(input)
    // const [width, setWidth] = useState(window.innerWidth);
    const fetch = () => 
      gf.search(input, { sort: "relevant", lang: "es", limit: 10 }); 
      
      return (
        <>
        <div>
          <Grid fetchGifs={fetch} width={800} columns={6} gutter={6} />
          </div>
        </>
      )
  
  }

  export default GifGrid;