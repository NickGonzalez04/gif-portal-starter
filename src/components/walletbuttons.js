import React from 'react';
import { useSolanaWallet } from '../hooks/hooks';



const WalletConnectButton = () => {
  const { connectWallet } = useSolanaWallet();

  return (
        <>
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              Connect to Wallet
            </button>
        </>
      )
};

export default WalletConnectButton;