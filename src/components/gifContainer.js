import React, { useState,  useEffect} from 'react';
import * as anchor from '@project-serum/anchor';
import Tip from '../assets/computerTip.png';
import PhantomImg from '../assets/phantom-logo.svg';
import kp from '../utils/keypair.json'
import Loader from './loader';
import { useSolanaWallet, useSetProvider} from '../hooks/hooks';
import { Grid,
Gif } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import GifGrid from './gridContainer';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';


import idl from '../utils/idl.json';
const { Provider, Program, web3 } = anchor;
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
const listOwner = new PublicKey('4Z4YSA9UdQ1pt9Fy8qbR46EvY263mo5TC5GLK1gVMmxR');
const gf = new GiphyFetch('BPkoNTFx7Fk0AGoSR67KJWbZksFRTK5J')


const GifContainer = () => {
    const { solanaAcct, myGIFs, setMyGIFs, connectWallet } = useSolanaWallet();
    const [ input, setInput ] = useState('');
    const [ searchRes, setSearchRes ] = useState([]);
    const [modalGif, setModalGif] = useState();
    const [gifId, setGifId ] = useState('')
    const [ loading, setLoading ] = useState(false);

    const sendGif = async () => {
      setLoading(true);
      if (gifId.length === 0) {
        console.log("No gift link");
        return
      }
      setInput('');
      setSearchRes(null); 
      console.log("Gif Link:", gifId.length);
     
      try {
        const { account } = await getBaseAcct();
        await program.rpc.addNewGif(`https://media.giphy.com/media/${gifId}/giphy.gif`, {
          accounts: {
            baseAccount: account,
            listOwner,
            user: solanaAcct,
          },
        });
        console.log("GIF sucesfully sent to program", input)
        await getGifList();
        setLoading(false);
      } catch (error) {
        console.log("Error sending GIF:", error)
      }

    };


    const upVote = async (string) => {
     
      try {
          const { account } = await getBaseAcct();
            await program.rpc.upVoteGif(string, {
              accounts: {
                baseAccount: account,
                listOwner,
                user: provider.wallet.publicKey,
              },
            });
            setLoading(true);
            await getGifList();  
            setLoading(false);
          } catch(error) {
            console.log(error)
      }
    };

    const downVote = async(string) => {
      try {
        const { account } = await getBaseAcct();
          await program.rpc.downVoteGif(string, {
            accounts: {
              baseAccount: account,
              listOwner,
              user: provider.wallet.publicKey,
            },
          });
          await getGifList();  
        } catch(error) {
          console.log(error)
    }
  };
      
  const getBaseAcct = async () => {
    let [account, bump] = await web3.PublicKey.findProgramAddress(
      [new TextEncoder().encode("ngGif3"), 
      listOwner.toBytes()],
      program.programId
    );
 
    return { account, bump };
  };

    const getAcct = async(account) => {
      const accountData = await program.account.baseAccount.fetch(account);
        console.log("Got the account", accountData.gifList);       
        let voteSorted = accountData.gifList.sort((a,b)=>  a.upvotes.toNumber() - b.upvotes.toNumber()).reverse();
        setMyGIFs(voteSorted);
    }
 
    const getGifList = async () => {
      try {
        let {account} = await getBaseAcct();
        await getAcct(account);
      } catch (e) {
        if (e) {
          await acctCreation();
        } else {
        console.log("Error in getGifs: ", e);
        setMyGIFs(null);
      }
    }
  };
  
  
  const acctCreation = async() => {
    console.log('here');
        let {account, bump } = await getBaseAcct();
       try {
       await program.rpc.initList(bump, {
          accounts: {
            baseAccount: account,
            user: solanaAcct,
            systemProgram: web3.SystemProgram.programId,
          }
        });
      } catch (error) {
        console.log("Error creating BaseAccount account:", error);
      }
    };
  
    useEffect(() => {
      console.log(window.solana)
      if (solanaAcct) {
        console.log('Getting GIF list...',solanaAcct);
        getGifList();
      } 
      
    }, [solanaAcct]);


//Gif search
const clearSearch = async()=>{
      setInput('');
}  

const GifRes = ({  onGifClick, input }) => {
 
  const fetch = () => 
    gf.search(input, { sort: "relevant", lang: "es", limit: 20 }); 
    // const [width, setWidth] = useState(window.innerWidth);
    return (
      <>
      <div className="grid-container">
        <Grid 
        onGifClick={onGifClick} 
        fetchGifs={fetch} 
        width={600}
        columns={3} 
        gutter={6} />
        </div>
      </>
    )
}

const tipUser = async(pubkey) => {
console.log(web3)
console.log(connection)
// console.log(web3.SystemProgram.transfer);
const transaction = new web3.Transaction().add(
  web3.SystemProgram.transfer({
    fromPubKey: solanaAcct,
    toPubKey: pubkey,
    lamports: web3.LAMPORTS_PER_SOL / 100,
  }));
let {tx} = await window.solana.signAndSendTransaction(transaction, connection, [solanaAcct]).then(res => console.log(res)).catch(error => console.log(error));
console.log(tx);
await connection.confirmTransaction(tx);

}

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
           <div className="search-container">
           <input
             type="search"
             placeholder="Search GIFs"
             value={input}
             onChange={(e) => setInput(e.target.value)}
           />
           <button
             className="cta-button submit-gif-button"
             onClick={() => clearSearch()}
           >
            ❌
           </button>
           <GifRes input={input}
           onGifClick={(gif, e) => {
            console.log("gif", gif.id);
            e.preventDefault();
            setModalGif(gif);
            setGifId(gif.id);
          }}/>
          {modalGif && (
              <div
                className="modal-gif"
                onClick={(e) => {
                  console.log(e);
                  e.preventDefault();
                  setModalGif(undefined);
                  setGifId('');
                }}>
                <Gif gif={modalGif} width={300} height={300} marginBottom={24} />
                <button
             className="cta-button submit-gif-button"
             onClick={() => sendGif()}>
          Add GIF to collection
           </button>
          </div>)}
                </div>
           <div className="gif-grid">
             {myGIFs.map((gif, i) => (
               <div className="gif-item" key={i}>
                 <div className="gif-item-img" >
                 <img src={gif.gifLink} alt={gif.gifLink} />
                 <div className="count-on-image">
                 <span className="arrow up-vote" onClick={()=> upVote(gif.gifLink)}>⬆</span>
                 <span className="count">{gif.upvotes.toNumber()}</span>
                 {gif.upvotes.toNumber() !== 0 ? <span className="arrow down-vote" onClick={()=> downVote(gif.gifLink)}>⬇</span> : null }
                 </div>
                </div>
                <div className="tip-on-image" onClick={()=> tipUser(gif.authority.toString())}>
                   <img src={Tip} alt="tip-on-internet" />
                   <p>Tip</p>
                 </div>
               <div className="gif-sender"> 
                 <img alt="phantom-logo" className="phantom-logo" src={PhantomImg} />
                 <p>{gif.authority.toString()}</p>
               </div>
             </div>
             ))}
           </div>
         </div>
       )}
     </div>
   );
};

export default GifContainer;