import React from 'react';
import spinner from '../assets/spinner.png'

const Loader = () => {

    return(
        <div>
            <img src={spinner} alt="loading..." />
        </div>
    )
}

export default Loader;