import React, { useContext, useState } from 'react';
import { SolanaWallet } from '../utils/solanaContext';


export const useInput=({type, placeHolder}) =>{
    const [ value, setValue ] = useState('');

    const input = <input placeholder={placeHolder} value={value} onChange={e => setValue(e.target.value)} type={type} />;
    return [value, input]
}

export const useSolanaWallet = () => {
    return useContext(SolanaWallet);
}