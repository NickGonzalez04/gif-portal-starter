import React, { useState,  useEffect} from 'react';
// import {MyGifs} from '../utils/gifs'
import PhantomImg from '../assets/phantom-logo.svg';
import kp from '../utils/keypair.json'
import { useSolanaWallet, useSetProvider} from '../hooks/hooks';


import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from '../utils/idl.json';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl('devnet');

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
};


const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
      return provider;
  }
  

const GifContainer = () => {
    const { solanaAcct, myGIFs, setMyGIFs, connectWallet } = useSolanaWallet();
//     const [giftLink, userInput] = useInput({
//     type: "text",
//     placeHolder: "Enter gif Link",
//   });
const [ input, setInput ] = useState('');

    const sendGif = async () => {
      if (input.length === 0) {
        console.log("No gift link");
        return
      }
      setInput(''); 
      console.log("Gif Link:", input.length);
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
    
        await program.rpc.addNewGif(input, {
          accounts: {
            baseAccount: baseAccount.publicKey,
          },
        });
        console.log("GIF sucesfully sent to program", input)
    
        await getGifList();
      } catch (error) {
        console.log("Error sending GIF:", error)
      }
    };



  
    const getGifList = async () => {
      try {

        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log("Got the account", account);
        setMyGIFs(account.gifList);
      } catch (error) {
        console.log("Error in getGifs: ", error);
        setMyGIFs(null);
      }
    };
  
  
      const acctCreation = async () => {
      try {
        const solprovider = getProvider();
        const program = new Program(idl, programID, solprovider);
        console.log("ping");
        await program.rpc.startStuffOff({
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: solprovider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [baseAccount],
        });
        console.log(
          "Created a new BaseAccount w/ address:",
          baseAccount.publicKey.toString()
        );
        await getGifList();
      } catch (error) {
        console.log("Error creating BaseAccount account:", error);
      }
    };
  
    useEffect(() => {
      if (solanaAcct) {
        console.log('Getting GIF list...');
        getGifList();

      }
    }, [solanaAcct]);
  
    
    
    return (
<div>
    {myGIFs === null ? (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={acctCreation}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
          </div>
) : (
    <div className="connected-container">
   <input
   type="text"
   placeholder="Enter yo GIF"
   value={input}
   onChange={(e)=> setInput(e.target.value)} />
    <button className="cta-button submit-gif-button" onClick={sendGif}>Send GIF</button>
    <div className="gif-grid">
    {myGIFs.map((gif, i)=>(
        <div className="gif-item" key={i}>
            <img src={gif.gifLink} alt={gif.gifLink} />
        </div>
    ))}
    </div></div>
   )}  
 </div> )
};

export default GifContainer;