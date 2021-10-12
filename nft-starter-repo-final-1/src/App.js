import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react"
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-kvjbjf4e5b';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xA282a65284F40eD83bD00DbbcA5b2ca0A2145070";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [nftlimit, setnftlimit, nftcount, setnftcount] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        setupEventListener()
    } else {
        console.log("No authorized account found")
    }

    const networkId = window.ethereum.networkVersion;

    if (networkId !== "4") {
      alert("This only works on Rinkeby!");
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

    // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

          console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log("Mining...please wait.")
          setLoading(true);
          await nftTxn.wait();
          
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object doesn't exist!");
          setLoading(false);
        }
      } catch (error) {
        console.log(error)
      }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  /*
  * We added a simple onClick event here.
  */
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  /*
  * We want the "Connect to Wallet" button to dissapear if they've already connected their wallet!
  */
  const renderMintUI = () => {
    if(loading) {
      return(<p className="sub-text">
            Loading...
          </p>
    )}
    else {
      return(<button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>)
    }
  }

  const getLimitNFT = async () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

          const TOTALNFTCOUNT = await connectedContract.getTotalNFTsMintedSoFar();

          this.setnftcount(TOTALNFTCOUNT.toNumber());
        }
      } catch (error) {
        console.log(error)
      }
    }

  const RenderNFTLimit = () => {
    getLimitNFT();
  return (
    <p className="sub-text">{`${nftcount}/${TOTAL_MINT_COUNT} NFTs minted so far`}</p>
  )}

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
          <RenderNFTLimit />
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <p>&nbsp;&nbsp;</p>
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >
          🌊 View Collection on OpenSea
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
