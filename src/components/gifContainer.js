import React, { useState,  useEffect} from 'react';
import * as anchor from '@project-serum/anchor';

// import {MyGifs} from '../utils/gifs'
import PhantomImg from '../assets/phantom-logo.svg';
import kp from '../utils/keypair.json'
import { useSolanaWallet, useSetProvider} from '../hooks/hooks';
import BN from 'bn.js';

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// import {
//   Program, Provider, web3
// } from '@project-serum/anchor';

import idl from '../utils/idl.json';
const { Provider, Program, web3 } = anchor;
// SystemProgram is a reference to the Solana runtime!
// const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
// const baseAccount = web3.Keypair.fromSecretKey(secret)

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
};
// Set our network to devent.
const network = 'https://api.devnet.solana.com';
const connection = new Connection(network, opts.preflightCommitment);
const provider = new Provider(connection, window.solana, opts.preflightCommitment);

// Get our program's id form the IDL file and sets as a new public key object.
const programID = new PublicKey(idl.metadata.address);
const program = new Program(idl, programID, provider);
const listOwner = new PublicKey('fdTo1hM5rJFmkCQ2sFMBMGycnSGBVcz45XRaGfAkRAu');



  const getBaseAcct = async () => {
    let [account, bump] = await web3.PublicKey.findProgramAddress(
      [new TextEncoder().encode("ngGif2"), 
      listOwner.toBytes()],
      program.programId
    );
    return { account, bump };
  };


const GifContainer = () => {
    const { solanaAcct, myGIFs, setMyGIFs, connectWallet } = useSolanaWallet();
    const [ input, setInput ] = useState('');

    const sendGif = async () => {
      if (input.length === 0) {
        console.log("No gift link");
        return
      }
      setInput(''); 
      console.log("Gif Link:", input.length);
      try {
        const { account } = await getBaseAcct();
        await program.rpc.addNewGif(input, {
          accounts: {
            baseAccount: account,
            listOwner,
            user: provider.wallet.publicKey
          },
        });
        console.log("GIF sucesfully sent to program", input)
    
        await getGifList();
      } catch (error) {
        console.log("Error sending GIF:", error)
      }
    };


const upVote = async (string) => {
  try {
  const { account } = await getBaseAcct();
  console.log(program);
    await program.rpc.upVoteGif(string, {
      accounts: {
        baseAccount: account,
        listOwner,
        user: provider.wallet.publicKey
      },
    });
  } catch(error) {
    console.log(error)
  }
};
  
    const getGifList = async () => {
      try {
        const { account } = await getBaseAcct();
        // const program = new Program(idl, programID, provider);
        const accountData = await program.account.baseAccount.fetch(account);
        console.log("Got the account", accountData.gifList);
        setMyGIFs(accountData.gifList);
      } catch (error) {
        console.log("Error in getGifs: ", error);
        setMyGIFs(null);
      }
    };
  
  
      const acctCreation = async() => {
      try {
        const { account, bump } = await getBaseAcct();
        // console.log(provider.wallet.publicKey)
       await program.rpc.initList(bump, {
          accounts: {
            baseAccount: account,
            user: provider.wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          }
        });
        console.log(
          "Created a new BaseAccount w/ address:",
          account.toString()
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
            <span>{gif.upvotes.toNumber()}</span>
            <button onClick={()=> upVote(gif.gifLink)}>✅</button>
        </div>
    ))}
    </div></div>
   )}  
 </div> )
};

export default GifContainer;