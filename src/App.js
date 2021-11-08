import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { SolanaWallet } from './utils/solanaContext';
import WalletConnectButton from './components/walletbuttons';
import GifContainer from './components/gifContainer';
// import idl from './utils/idl.json'
// import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
// import {
//   Program, Provider, web3
// } from '@project-serum/anchor';
// import { useProvider } from './hooks/hooks';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;




// // SystemProgram is a reference to the Solana runtime!
// const { SystemProgram, Keypair } = web3;

// // Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();

// // Get our program's id form the IDL file.
// const programID = new PublicKey(idl.metadata.address);

// // Set our network to devent.
// const network = clusterApiUrl('devnet');

// // Control's how we want to acknowledge when a trasnaction is "done".
// const opts = {
//   preflightCommitment: "processed"
// }



const useSolanaWallet = ()=> {
    const [solanaAcct, setSolanaAcct ] = useState('');
    const [ myGIFs, setMyGIFs] = useState([]);

    const checkConnectedWallet = async() => {
        try{
          const { solana } = window;

          if(solana) {
            if (solana.isPhantom) {
              const walletResponse = await solana.connect({ onlyIfTrusted: true});
              console.log(
                'Connected with pub key',
                walletResponse.publicKey.toString()
              );
              const walletKey =  walletResponse.publicKey.toString();
              setSolanaAcct(walletKey);
            }
          } else {
            alert('Solana object not found. Get a 👻 Phantom Wallet. -> https://phantom.app/')
          }
        } catch (error) {
          console.log(error);
        }
    }

    const connectWallet = async()=> {
      const { solana} = window;
      if(solana) {
        const walletResponse = await solana.connect();

        setSolanaAcct(walletResponse.publicKey.toString());
      }
    };

    useEffect(()=>{
      connectWallet();
    },[]);


    return { solanaAcct, myGIFs, setMyGIFs, checkConnectedWallet, connectWallet };
}




const App = () => {

  const solanaWallet = useSolanaWallet();


  const renderNotConnected = ()=>(
      <WalletConnectButton />
  );

  const renderConnectedContainer = () => (
      <GifContainer />
  );

  return (
    <div className="App">
      <SolanaWallet.Provider value={solanaWallet}>
      <div className={solanaWallet ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 Not gifted, but I Got Gifs</p>
          <p className="sub-text">
            View your GIF collection in the metaverse w/ Solana ✨
          </p>
          {!solanaWallet && renderNotConnected()}
          {SolanaWallet && renderConnectedContainer ()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
      </SolanaWallet.Provider>
    </div>
  );
};

export default App;
