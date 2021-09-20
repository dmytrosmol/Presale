import { useState, useLayoutEffect, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import { PreSale } from "./contract/environment";
import preSaleABI from "./contract/preSaleABI.json";
// import { CopyToClipboard } from "react-copy-to-clipboard";
// import ClipLoader from "react-spinners/ClipLoader";
import { token } from './contract/environment'
import "./App.css";
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");





var refLink;
let getRefAddress = localStorage.getItem("LovePort");
let getDirectFromUrl;
let url = window.location.href;
if (url.includes("?ref=")) {
  let getAddress = url.split("?ref=")[1];
  let final = getAddress.slice(0, 42);
  getDirectFromUrl = final;
}


function App() {
  const [state, setState] = useState({
    account: undefined,
    preSaleVal: null,
    toWei: null,
    owner: null,
    fromWei: null,
    connectMetaMask: null,
    claimTime: "",
    allowance: "",
    copied: false,

  });
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");
  const [loadingClaimDrop, setLoadingClaimDrop] = useState(false);
  const [BNBPrice, setBNBprice] = useState("");
  refLink = getDirectFromUrl ? getDirectFromUrl : getRefAddress ? getRefAddress : state.owner
  // console.log("BNBPrice", BNBPrice);
  // console.log("state", state);
  // console.log("state", state);
  const connectToMetaMask = async (connect) => {
    try {
      const accounts = await connect();
      setState((prevState) => ({ ...prevState, account: accounts[0] }));
    } catch (error) {
      console.error("requestAccounts", error);
    }
  };

  useLayoutEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const preSaleVal = new web3.eth.Contract(preSaleABI, PreSale);

      setState((prevState) => ({
        ...prevState,
        preSaleVal,
        toWei: web3.utils.toWei,
        fromWei: web3.utils.fromWei,
        connectMetaMask: () => connectToMetaMask(web3.eth.requestAccounts),
      }));

      //   connectToMetaMask(web3.eth.requestAccounts);
      preSaleVal.methods
        .owner()
        .call()
        .then((res) => {
          // console.log("res", res);
          setState((prevState) => ({ ...prevState, owner: res }));
        });
      // one bnb value
      preSaleVal.methods
        .bnbToToken("1000000000000000000")
        .call()
        .then((val) => setBNBprice(val))
        .catch((e) => console.log("e", e));
    } else {
      alert("Please install MetaMask");
    }
  }, []);
  const connetToWalletBtn = () => {
    alert("connect");
  };
  // const digits_only = (string) =>
  //   [...string].every((c) => "0123456789".includes(c));
  // const validate = (email) => {
  //   var re = /^[0-9\b]+$/;
  //   return re.test(String(email).toLowerCase());
  // };
  const checkValue = (e) => {
    setSwapFrom(e);
    if (e != "") {
      // console.log("work");
      state.preSaleVal.methods
        .bnbToToken(state.toWei(e))
        .call()
        .then((val) => setSwapTo(val))
        .catch((e) => console.log("e", e));
    } else {
      let val = e.substring(0, e.length - 1);
      setSwapFrom(val);
    }
  };
  const buyLovePot = () => {
    // console.log("swapTo", swapFrom);
    // console.log("state.toWei(swapFrom)", state.toWei(swapFrom));
    // console.log("state.account", state.account);
    // console.log("state.owner", state.owner);
    if (swapFrom > 0) {
      state.preSaleVal.methods
        .buyTokenLove(refLink)
        .send({ value: state.toWei(swapFrom), from: state.account })
        .then((val) => toast.success("Successfully!"))
        .catch((e) => toast.error("Failed!"));
    }
  };
  
  const toggleMenu = () => {
    document.getElementById("menu").classList.toggle("hidden");
  };
  // const toggleList = () => {
  //   document.getElementById("curr-menu").classList.toggle("hidden");
  // };
  // const setToOption1 = () => {
  //   document.getElementById("currency-value").textContent = "BUSD";
  //   document.getElementById("curr-menu").classList.add("hidden");
  // };
  // const setToOption2 = () => {
  //   document.getElementById("currency-value").textContent = "BNB";
  //   document.getElementById("curr-menu").classList.add("hidden");
  // };
  const hideModal = () => {
    document.getElementById("newsletter").classList.add("hidden");
  };
  useEffect(() => {
    if (window.location.href.includes("?ref=")) {
      let getAddress = window.location.href.split("?ref=")[1];

      let final = getAddress.slice(0, 42);
      localStorage.setItem("LovePort", final);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        window.ethereum.on("accountsChanged", (accounts) => {
          let final = web3.utils.toChecksumAddress(accounts[0]);
          setState((prevState) => ({ ...prevState, account: final }));
        });
      } catch (err) { }
      try {
        if (typeof window.ethereum !== "undefined") {
          await web3.eth.getAccounts((err, accs) => {
            setState((prevState) => ({ ...prevState, account: accs[0] }));
          });
        }
      } catch (err) { }
    })()
  }, [])




  return (
    <div onClick={hideModal} className="relative">
      <ToastContainer />
      <div
        id="newsletter"
        className="relative flex items-center justify-center w-full h-full modal"
      >
        <div className="absolute z-30 flex flex-col items-center justify-center w-9/12 px-4 py-8 bg-gray-900 shadow-lg modalbox-height modal-box sm:w-7/12 md:w-8/12 lg:w-5/12 top-24 xl:px-10">
          <h1 className="text-xl font-medium text-center text-white sm:text-2xl md:text-3xl">
            Connect to a wallet
          </h1>
          <div className="w-full mt-8 rounded-2xl md:mt-16">
            <button
              onClick={!state.account ? state.connectMetaMask : undefined}
              className="flex items-center justify-between w-full px-2 py-2 modal-button1 md:px-4 md:py-4"
            >
              <p className="text-xl text-white sm:text-2xl md:text-3xl">
                Metamask
              </p>
              <div>
                <img src="https://www.lovepot.finance/img/meta.svg" alt="" />
              </div>
            </button>
          </div>
          <button
            onClick={!state.account ? state.connectMetaMask : undefined}
            className="flex items-center justify-between w-full px-2 py-2 mt-4 border-4 border-gray-600 md:px-4 md:py-4 md:mt-8"
          >
            <p className="text-xl text-gray-100 sm:text-2xl md:text-3xl">
              Trust Wallet
            </p>
            <div>
              <img src="https://www.lovepot.finance/img/trust.svg" alt="" />
            </div>
          </button>
          <button
            onClick={!state.account ? state.connectMetaMask : undefined}
            className="flex items-center justify-between w-full px-2 py-2 mt-4 border-4 border-gray-600 md:px-4 md:py-4 md:mt-8"
          >
            <p className="text-xl text-gray-100 sm:text-2xl md:text-3xl">
              SafePal
            </p>
            <div>
              <img src="https://www.lovepot.finance/img/safepal.svg" alt="" />
            </div>
          </button>
        </div>
      </div>
      <div className="relative pb-4 sm:pb-8 lg:pb-16" style={{ backgroundColor: "#1e134b" }}>
        <div className="container relative z-10 mx-auto xl:px-20">
          <div className="relative flex items-center justify-between p-4 bg-gray-50 bg-opacity-5">
            <div
              id="menu"
              className="absolute z-20 hidden w-6/12 px-4 py-8 bg-gray-900 shadow-2xl lg:hidden top-12 right-10 md:w-5/12"
            >
              <ul className="flex flex-col space-y-8">
              <li className="pb-2 border-b border-gray-600">
                  <a
                    href="https://www.lovepot.finance/swap/"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Swap
                  </a>
                </li>
                <li className="pb-2 border-b border-gray-600">
                  <a
                    href="https://www.lovepot.finance/pools"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Love Pools
                  </a>
                </li>
                <li className="pb-2 border-b border-gray-600">
                  <a
                    href="https://www.lovepot.finance/"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    JackPot
                  </a>
                </li>
                <li className="pb-2 border-b border-gray-600">
                  <a
                    href="javascript:void(0)"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Whitepaper
                  </a>
                </li>
                <li className="pb-2 border-b border-gray-600">
                  <a
                    href="javascript:void(0)"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    News
                  </a>
                </li>
              </ul>
              <div className="flex flex-col mt-8 space-y-8">
                <button className="px-3 py-1 text-white bg-transparent rounded-full bnb-border">
                  BNB
                </button>
                <button className="px-3 py-1 text-white bg-transparent rounded-full button-md-bg">
                  {state.account ? state.account?.slice(0, 5) + "..." + state.account?.slice(-5) : "Connect Wallet"}
                </button>
              </div>
            </div>
            <div className="w-1/4 logonew">
              <img
                src="https://lovepot.finance/images/logo.png"
                alt=""
              />
            </div>
            <div
              className="lg:hidden ml-12"
            >
                <button className="px-3 py-1 text-white bg-transparent rounded-full button-md-bg">
                  {state.account ? state.account?.slice(0, 5) + "..." + state.account?.slice(-5) : "Connect Wallet"}
                </button>

            </div>
            <div className="flex justify-center hidden w-1/2 lg:block">
              <ul className="flex items-center space-x-8">
                <li>
                  <a
                    href="https://www.lovepot.finance/"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Jackpot
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.lovepot.finance/pools"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Love Pools
                  </a>
                </li>
                <li>
                  <a
                    href="https://lovepot.finance/swap?outputCurrency=0xd631d33F2c3f38d9ABDaE08ebC0B69fA636E8ec2"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Swap
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className="text-base text-white hover:underline"
                    target="_blank"
                  >
                    News
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-end hidden w-1/4 space-x-6 lg:block">
              <a
                href="javascript:void(0)"
                className="text-white hover:underline"
              >
                BNB
              </a>
              {state.account ? (
                <button
                  className="px-6 py-2 text-white rounded-full hover:underline"
                  style={{ backgroundColor: "#e21b63" }}
                // onClick={() => connectToMetaMask()}
                // onClick={()=>state.connectMetaMask}
                >
                  {state.account.slice(0, 6) + "..." + state.account.slice(-4)}
                </button>
              ) : (
                <button
                  className="px-6 py-2 text-white rounded-full hover:underline"
                  style={{ backgroundColor: "#e21b63" }}
                  onClick={!state.account ? state.connectMetaMask : undefined}
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-menu-2"
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="#ffffff"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex px-4 md:px-6 lg:px-10 ">
            <div className="flex flex-col justify-center mt-1 sm:mt-4 md:mt-12 lg:mt-20 ">
              <h1 className="text-xl font-medium leading-normal text-white sm:text-2xl md:text-3xl lg:text-4xl">
                NO LOSS JACKPOT By LOVEPOT
              </h1>
              <p className="mt-4 leading-normal text-gray-300 text-xm sm:text-base lg:w-8/12">
                The Love Pot Collects The Total Yield (Profits) Accrued Over A
                Set Period Of Time Based On The Total Stake, And Distributes
                These Profits To One Of The Pot Participants.
              </p>
              <button className="w-11/12 px-8 py-2 mt-8 text-white rounded-full bg-button-image sm:w-5/12 md:w-4/12 lg:w-3/12 hover:underline">
                <a href="https://t.me/Lovepot_finance" target="_blank"> Join Community</a>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: "#1e134b" }}>
        <div className="container flex flex-col items-center justify-center mx-auto text-center py-14 sm:py-12">
          <h1 className="text-2xl text-white md:text-4xl lg:text-5xl gray-600">
            Buy LovePot ($LOVE)
          </h1>
          <p className="mt-4 text-xs text-white sm:text-base lg:text-lg">
            MIN: ~0.05 BNB / MAX: ~5 BNB (+GAS BNB / BEP20)
          </p>
          <p className="mt-4 text-xs text-white sm:text-base lg:text-lg">
            24 October 2021 Listing on PancakeSwap
          </p>
          <div className="px-2">
            <div
              style={{ backgroundColor: "#1e134b" }}
              className="flex flex-col items-center px-4 py-2 mt-8 rounded-full sm:flex-row shadow-css1 md:py-2 sm:space-x-2"
            >
              <div className="flex items-center space-x-2">
                <p
                  className="text-base italic font-black lg:text-lg"
                  style={{ color: "rgb(116, 63, 229)" }}
                >
                  Attention:{" "}
                </p>
              </div>
              <p className="text-sm italic font-black text-white md:text-base">
                ICO Price 0,04 BUSD, Pancakeswap Listing Price 0,05 BUSD
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-11/12 p-4 mt-6 md:mt-12 lg:w-5/12 border-rounded-table rounded-3xl content-area md:p-6 shadow-css">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-bold text-white md:text-2xl">Swap</h2>
              <div>
                <img src="https://www.lovepot.finance/img/setting.svg" alt="" />
              </div>
            </div>
            <div
              style={{ backgroundColor: "#1e134b" }}
              className="flex justify-between w-full px-2 pt-4 pb-2 mt-4 md:mt-6 md:pt-6 md:px-4 md:pb-4 rounded-2xl md:rounded-3xl shadow-css1 "
            >
              <div className="flex flex-col justify-start space-y-4 md:space-y-8">
                <p
                  style={{ color: "#392c6e" }}
                  className="text-lg text-left text-gray-600"
                >
                  <strong>From</strong>
                </p>
                <input
                  id="valid-amount"
                  type="text"
                  type="number"
                  placeholder="0"
                  className="w-40 text-3xl text-white bg-transparent focus:outline-none"
                  value={swapFrom}
                  //  type="number"
                  onChange={(e) => checkValue(e.target.value)}
                />
              </div>
              <div className="relative flex flex-col justify-end">
                <button
                  //   onClick={toggleList}
                  className="flex items-center px-1 py-2 space-x-4 rounded-lg content-area-button md:py-3 md:px-2"
                >
                  <div>
                    <img src="https://www.lovepot.finance/img/bnb.svg" alt="" />
                  </div>
                  <p
                    id="currency-value"
                    className="text-base text-white md:text-xl"
                  >
                    BNB
                  </p>
                  <div>
                    <img
                      src="https://www.lovepot.finance/img/down.svg"
                      alt=""
                    />
                  </div>
                </button>

                {/* <div
                  id="curr-menu"
                  className="absolute z-10 flex flex-col hidden w-11/12 pt-1 pb-1 bg-gray-900 rounded -bottom-28"
                >
                  <button
                    onClick={setToOption1}
                    className="px-2 pb-3 text-base text-left text-white border-b border-gray-300 md:text-xl hover:bg-gray-800"
                  >
                    BUSD
                  </button>
                  
                  <button
                    onClick={setToOption2}
                    className="px-2 pb-3 text-base text-left text-white border-b border-gray-300 md:text-xl hover:bg-gray-800"
                  >
                    BNB
                  </button>
                </div> */}
              </div>
            </div>

            <div className="mt-4 md:mt-8">
              <img src="https://www.lovepot.finance/img/Arrow2.svg" alt="" />
            </div>
            <div
              style={{ backgroundColor: "#1e134b" }}
              className="flex justify-between w-full px-4 pt-6 pb-4 mt-4 bg-gray-900 shadow-2xl md:mt-8 rounded-3xl shadow-css1"
            >
              <div className="flex flex-col justify-start space-y-4 md:space-y-8">
                <p
                  style={{ color: "#392c6e" }}
                  className="text-lg text-left text-gray-600"
                >
                  <strong>To</strong>
                </p>
                <input
                  type="text"
                  value={swapTo}
                  style={{ width: 150 }}
                  className="w-10 text-3xl text-white bg-transparent focus:outline-none"
                />
              </div>
              <div className="relative flex flex-col justify-end">
                <button className="flex items-center w-full px-1 py-2 space-x-8 rounded-lg content-area-button md:py-3 md:px-4">
                  <div>
                    <img
                      src="https://www.lovepot.finance/img/icon3.png"
                      alt=""
                      className=""
                    />
                  </div>
                  <p id="currency-value" className="text-xl text-white">
                    LOVE
                  </p>
                  <div>
                    <img
                      src="https://www.lovepot.finance/img/down.svg"
                      alt=""
                    />
                  </div>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between w-full px-4 mt-4">
              <p className="text-white">Price</p>
              <p className="font-medium text-white">{BNBPrice} LOVE per BNB</p>
            </div>
            {state.account ? (
              <button
                onClick={buyLovePot}
                className="w-full py-2 mt-6 text-xl text-white uppercase rounded-full shadow-inner md:mt-10 lg:mt-6 content-area-button lg:py-4 sm:text-2xl lg:text-3xl"
              >
                Buy LovePot
              </button>
            ) : (
              <button onClick={!state.account ? state.connectMetaMask : undefined} className="w-full py-2 mt-6 text-xl text-white uppercase rounded-full shadow-inner md:mt-10 lg:mt-6 content-area-button lg:py-4 sm:text-2xl lg:text-3xl">
                Connect to Wallet
              </button>
            )}
          </div>
          <div className="flex justify-center mt-7 md:mt-14">
            <p className="w-11/12 text-lg text-center text-white md:w-7/12">
              Buy and Stake in Pool Earn More rewards during Presale and after Presale as well.
            </p>
          </div>
          <div className="mt-7 md:mt-14">
            <p className="text-xs font-bold text-white sm:text-xs lg:text-lg">
              TOKEN ADDRESS: {token} 
            </p>
            <button 
             onClick={() =>  navigator.clipboard.writeText('0xd631d33f2c3f38d9abdae08ebc0b69fa636e8ec2')}
             className="px-3 py-1 text-white bg-transparent rounded-full bnb-border"
          >
             Click To Copy
          </button>
          </div>
          <div
            style={{ backgroundColor: "#1e134b" }}
            className="flex flex-col justify-center p-2 mx-4 mt-8 bg-gray-900 md:mt-10 lg:mt-20 sm:flex-row rounded-xl lg:w-12/12"
          >
            <p
              className="text-sm italic"
              style={{ color: "rgb(116, 63, 229)" }}
            >
              Disclaimer: 
            </p>
            <p className="text-sm italic text-white">
              Please be aware of the risks involved with any trading done in any financial market. Do not trade with money that you cannot afford to lose. When in doubt, you should consult a qualified financial advisor before making any investment decisions. Please note there are always risks associated with Crypto Token and Coin. Please use at your own risk. We are not a financial, analyst or investment advisor. All information contained herein should be independently verified and confirmed. We do not accept any liability for any loss or damage whatsoever caused in reliance upon such information or services.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full py-8 space-x-10 content-area">
        <a href="https://t.me/Lovepot_finance" className="text-white hover:underline" target="_blank">
          Telegram
        </a>
        <a href="javascript:void(0)" className="text-white hover:underline" target="_blank">
          Twitter
        </a>
        <a href="javascript:void(0)" className="text-white hover:underline" target="_blank">
          News
        </a>
      </div>
    </div>
  );
}

export default App;
