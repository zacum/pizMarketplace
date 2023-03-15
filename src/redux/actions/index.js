import axios from "axios";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import metaMask from "../../assets/images/metamask.png";
import { NFTcontractRead } from "../../config/contractConnect";
import { showNotification } from '../../utils/helpers';
import {
  NFT_ADDRESS,
  NFT_ABI,
  FT_ADDRESS,
  FT_ABI,
  AUCTION_ADDRESS,
  AUCTION_ABI,
} from "../../config/contract";
import {
  GET_USER_INFO,
  GET_TOP_OWNER,
  GET_NFT_ID,
  GET_SELECTED_USER_INFO,
  UPDATE_PRICE,
  UPDATE_USERINFO,
  HISTORY_FIND_ALL,
  BID_FIND_ALL,
  HOT_AUCTION_GET,
  BID_FIND_ONE,
  WALLET_CONNECT,
  WALLET_DISCONNECT,
  GET_FOLLOW,
  UPDATE_USERINFO_NO_PROFILE,
} from "../types";

let web3Modal = null;
const BACKEND_API = `${process.env.REACT_APP_BACKEND_API}/api`;

export const userInfo = (account) => (dispatch, getState) => {
  try {
    axios.get(`${BACKEND_API}/profile/${account}`).then((res) => {
      if (res.status != 200) return;
      dispatch({
        type: GET_USER_INFO,
        payload: res.data,
      });
    });
  } catch (error) {
    console.log("User Info Get ", error);
  }
};

export const NftTokenID = (offset, limit) => (dispatch, getState) => {
  try {
    axios
    .get(`${BACKEND_API}/nfts?offset=${offset}&limit=${limit}`)
    .then((res) => {
      if (res.status != 200) return;
      let midArr = []
      res.data.nftIDs.map((item) => {
        midArr.push(item.tokenId);
      });
      const total = res.data.total

      dispatch({
        type: GET_NFT_ID,
        payload: {
          total,
          token_ids: midArr,
        },
      });
    });
  } catch (error) {
    console.log("Get NFT Token IDS ", error);
  }
};

export const topOwner = () => (dispatch, getState) => {
  try {
    axios
      .get(`${BACKEND_API}/owners`)
      .then(async (res) => {
        if (res.status != 200) return;
        let owner_info = [];

        for (let i = 0; i < res.data.total; i++) {
          const item = res.data.owners[i];
          const ownerAddress = ethers.utils.getAddress(item.ownerOf)

          if (
            ethers.utils.getAddress(item.tokenAddress) ===
            ethers.utils.getAddress(process.env.REACT_APP_NFT_ADDRESS.toLocaleLowerCase())
          ) {
            let price = await NFTcontractRead.prices(item.tokenId);

            if (owner_info[ownerAddress] === undefined) {
              let profileImg = "";
              let name = "";
              let coverImg
              let email
              let facebook
              let bio
              let instagram
              let discord
              let twitter

              try {
                await axios
                  .get(
                    `${BACKEND_API}/profile/${ownerAddress}`
                  )
                  .then((res) => {
                    if (res.status != 200) return;
                    profileImg = res.data[0]?.profileImg;
                    name = res.data[0]?.name;
                    coverImg = res.data[0]?.coverImg
                    email = res.data[0]?.email
                    facebook = res.data[0].facebook,
                    bio = res.data[0].bio
                    instagram = res.data[0].instagram
                    discord = res.data[0].discord
                    twitter = res.data[0].twitter
                  });
              } catch (err) {}

              owner_info[ownerAddress] = {
                count: 1,
                tokens: [item.tokenId],
                price: +ethers.utils.formatEther(price),
                profileImg: profileImg,
                name: name,
                coverImg,
                email,
                facebook,
                bio,
                instagram,
                discord,
                twitter
              };
            } else {
              owner_info[ownerAddress].count++;
              owner_info[ownerAddress].tokens.push(item.tokenId);
              owner_info[ownerAddress].price +=
                +ethers.utils.formatEther(price);
            }
          }
        }

        let owner_info_sort = Object.entries(owner_info);
        owner_info_sort.sort((a, b) => b[1].price - a[1].price);

        dispatch({
          type: GET_TOP_OWNER,
          payload: {
            top_owners: owner_info_sort.slice(0, 6),
          },
        });
      });
  } catch (error) {
    console.log("Get Top Owner ", error);
  }
};

export const selectedUserInfo = (account) => (dispatch, getState) => {
  try {
    axios.get(`${BACKEND_API}/profile/${account}`).then((res) => {
      if (res.status != 200) return;
      dispatch({
        type: GET_SELECTED_USER_INFO,
        payload: res.data,
      });
    });
  } catch (error) {
    console.log("User Info Get ", error);
  }
};

export const updateUserInfo =
  (account, name, profileImg, profileUrl, coverImg, email, facebook, bio, instagram, discord, twitter) => (dispatch, getState) => {
    try {
      const formData = new FormData();
      if(typeof(profileImg) === 'object') formData.append("profileImg", profileImg)
      if(typeof(coverImg) === 'object') formData.append("coverImg", coverImg)
      formData.append("name", name);
      formData.append("profileUrl", profileUrl);
      formData.append("email", email)
      formData.append("facebook", facebook)
      formData.append("bio", bio)
      formData.append("instagram", instagram)
      formData.append("discord", discord)
      formData.append("twitter", twitter)
      
      axios({
        method: 'put',
        headers: {Accept: "multipart/form-data", "Content-Type": "image/jpeg"},
        url: `${BACKEND_API}/profile/${ethers.utils.getAddress(account)}`,
        data: formData
      })
      .then((res) => {
        if (res.status == 200) {
          dispatch({
            type: UPDATE_USERINFO,
            payload: {
              profileImg,
              name,
              profileUrl,
              coverImg,
              email,
              facebook,
              bio,
              instagram,
              discord,
              twitter
            },
          });
          showNotification({
            title: 'Success',
            message: 'Profile information successfully updated',
            type: 'success',
            insert: 'top',
            container: 'top-right'
          })
        } else {
          showNotification({
            title: 'Warning',
            message: 'Profile information update failed',
            type: 'warning',
            insert: 'top',
            container: 'top-right'
          })
        }
      });
    } catch (error) {
      console.log("userInfo Update ", error);
    }
  };

export const updateUserInfoNoImg =
  (account, name, profileUrl) => (dispatch, getState) => {
    try {
      axios
        .put(
          `${BACKEND_API}/profileNoProfile/${ethers.utils.getAddress(account)}`,
          { name: name, profileUrl: profileUrl }
        )
        .then((res) => {
          if (res.status == 200) {
            dispatch({
              type: UPDATE_USERINFO_NO_PROFILE,
              payload: {
                name: name,
                profileUrl: profileUrl,
              },
            });
            showNotification({
              title: 'Success',
              message: 'Profile image successfully updated',
              type: 'success',
              insert: 'top',
              container: 'top-right'
            })
          } else {
            showNotification({
              title: 'Warning',
              message: 'Profile image update failed',
              type: 'warning',
              insert: 'top',
              container: 'top-right'
            })
          }
        });
    } catch (error) {
      console.log("userInfo Update ", error);
    }
  };

export const createAuction = (owner, tokenId) => (dispatch, getState) => {
  try {
    axios
      .post(`${BACKEND_API}/auction/create`, { owner: owner, tokenId: tokenId })
      .then((res) => {
        if (res.status == 200) {
          showNotification({
            title: 'Success',
            message: 'Auction created successfully',
            type: 'success',
            insert: 'top',
            container: 'top-right'
          })
        } else {
          showNotification({
            title: 'Warning',
            message: 'Auction creation failed',
            type: 'warning',
            insert: 'top',
            container: 'top-right'
          })
        }
      });
  } catch (error) {
    console.log("Cancel Auction ", error);
  }
};

export const updateAuction =
  (owner, tokenId, status) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/auction/update`, {
          owner: owner,
          tokenId: tokenId,
          status: status,
        })
        .then((res) => {
          if (res.status == 200) {
            showNotification({
              title: 'Success',
              message: 'Auction settled successfully',
              type: 'success',
              insert: 'top',
              container: 'top-right'
            })
          } else {
            showNotification({
              title: 'Warning',
              message: 'Auction settle failed',
              type: 'warning',
              insert: 'top',
              container: 'top-right'
            })
          }
        });
    } catch (error) {
      console.log("Update Auction ", error);
    }
  };

export const makeBid =
  (tokenId, nftOwner, bidder, amount, recipient) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/bid/create`, {
          nftOwner,
          tokenId,
          bidder,
          amount,
          recipient,
        })
        .then((res) => {
          if (res.status == 200) {
            showNotification({
              title: 'Success',
              message: 'You placed a bid successfully',
              type: 'success',
              insert: 'top',
              container: 'top-right'
            })
          } else {
            showNotification({
              title: 'Warning',
              message: 'Placing bid failed',
              type: 'warning',
              insert: 'top',
              container: 'top-right'
            })
          }
        });
    } catch (error) {
      console.log("MakeBid ", error);
    }
  };

export const updateBid =
  (tokenId, nftOwner, bidder, amount, status) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/bid/update`, {
          owner: nftOwner,
          tokenId: tokenId,
          status: status,
        })
        .then((res) => {
          if (res.status == 200) {
            showNotification({
              title: 'Success',
              message: 'you bid successfully updated',
              type: 'success',
              insert: 'top',
              container: 'top-right'
            });
          } else {
            showNotification({
              title: 'Warning',
              message: 'Updating bid failed',
              type: 'warning',
              insert: 'top',
              container: 'top-right'
            })
          }
        });
    } catch (error) {
      console.log("Update Bid ", error);
    }
  };

export const historyFindAll = (tokenId) => (dispatch, getState) => {
  try {
    axios
      .post(`${BACKEND_API}/history/all`, { tokenId: tokenId })
      .then((res) => {
        if (res.status != 200) return;
        dispatch({
          type: HISTORY_FIND_ALL,
          payload: res.data,
        });
      });
  } catch (error) {
    console.log(error);
  }
};

export const bidFindAll =
  (tokenId, owner, status = "create") =>
  (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/bid/all`, {
          tokenId: tokenId,
          owner: owner,
          status: status,
        })
        .then((res) => {
          if (res.status != 200) return;
          dispatch({
            type: BID_FIND_ALL,
            payload: res.data,
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

export const bidFindOne =
  (tokenId, nftOwner, bidder) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/bid/findone`, {
          tokenId: tokenId,
          nftOwner: nftOwner,
          bidder: bidder,
        })
        .then((res) => {
          if (res.status != 200) return;
          dispatch({
            type: BID_FIND_ONE,
            payload: { bidstatus: res.data },
          });
        });
    } catch (error) {
      console.log("Bid FindOne ", error);
    }
  };

export const nftMint = (tokenId, owner) => (dispatch, getState) => {
  try {
    axios
      .post(`${BACKEND_API}/mint`, { tokenId: tokenId, owner: owner })
      .then((res) => {
        if (res.status != 200) return;
      });
  } catch (error) {
    console.log("MINT ", error);
  }
};

export const nftUpdatePrice =
  (tokenId, owner, prevPrice, currPrice) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/updateprice`, {
          tokenId: tokenId,
          owner: owner,
          prevPrice: prevPrice,
          currPrice: currPrice,
        })
        .then((res) => {
          if (res.status != 200) return;
          dispatch({
            type: UPDATE_PRICE,
            payload: { price: currPrice },
          });
          showNotification({
            title: 'Success',
            message: 'price updated successfully',
            type: 'success',
            insert: 'top',
            container: 'top-right'
          })
        });
    } catch (error) {
      console.log("Update Price ", error);
    }
  };

export const hotAuctionGet = () => (dispatch, getState) => {
  try {
    axios.get(`${BACKEND_API}/hotauction`).then((res) => {
      if (res.status != 200) return;
      dispatch({
        type: HOT_AUCTION_GET,
        payload: res.data,
      });
    });
  } catch (error) {
    console.log("Hot Auction ", error);
  }
};

export const settleAuction =
  (tokenId, owner, from, to) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/settleauction`, {
          tokenId,
          owner,
          from,
          to,
        })
        .then((res) => {});
    } catch (error) {
      console.log("Settle Auction ", error);
    }
  };

export const nftTransfer =
  (tokenId, owner, from, to) => (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/transfer`, {
          tokenId: tokenId,
          owner: owner,
          from: from,
          to: to,
        })
        .then((res) => {
          if (res.status != 200) return;
          dispatch({
            type: UPDATE_PRICE,
            payload: res.data,
          });
          showNotification({
            title: 'Success',
            message: 'NFT successfully transferred',
            type: 'success',
            insert: 'top',
            container: 'top-right'
          })
        });
    } catch (error) {
      console.log("Transfer ", error);
    }
  };

export const walletConnect = () => async (dispatch, getState) => {
  try {
    alert("1");
    const providerOptions = {
      injected: {
        display: {
          name: "Metamask",
          description: "For desktop web wallets",
          logo: metaMask,
        },
      },
      walletconnect: {
        display: {
          name: "WalletConnect",
          description: "For mobile app wallets",
        },
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
        },
      },
    };
    
    alert("2", providerOptions)

    web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      disableInjectedProvider: false,
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)",
      },
    });
    alert("3", web3Modal);
    let instance = await web3Modal.connect();
    alert("4", instance)
    let provider = new ethers.providers.Web3Provider(instance);
    let signer = provider.getSigner();
    alert("5", signer)
    provider.on("disconnect", () => {
      dispatch(walletDisconnect());
    });

    const NFTcontract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
    const FTcontract = new ethers.Contract(FT_ADDRESS, FT_ABI, signer);
    const AUCTIONcontract = new ethers.Contract(
      AUCTION_ADDRESS,
      AUCTION_ABI,
      signer
    );
    const account = await signer.getAddress();
    const mintPrice = await NFTcontract.getMintPrice();
    localStorage.setItem("account", account);
    dispatch(userInfo(ethers.utils.getAddress(account)));
    dispatch({
      type: WALLET_CONNECT,
      payload: {
        account: account,
        NFTcontract: NFTcontract,
        FTcontract: FTcontract,
        AUCTIONcontract: AUCTIONcontract,
        mintPrice: mintPrice,
      },
    });
  } catch (error) {
    console.log("Wallet Connect ", error);
  }
};

export const walletDisconnect = () => async (dispatch, getState) => {
  try {
    localStorage.setItem("account", "");
    await web3Modal.clearCachedProvider();
    dispatch({
      type: WALLET_DISCONNECT,
      payload: {
        account: null,
        NFTcontract: null,
        AUCTIONcontract: null,
      },
    });
  } catch (error) {
    console.log("Wallet Disconnect ", error);
  }
};

export const addFollow =
  (owner, followAccount) => async (dispatch, getState) => {
    try {
      axios
        .post(`${BACKEND_API}/follow/create`, {
          owner: owner,
          followAccount: followAccount,
        })
        .then((res) => {
          dispatch(getFollow(owner));
        });
    } catch (err) {
      console.log("Add follow ", err);
    }
  };

export const getFollow = (owner) => async (dispatch, getState) => {
  try {
    axios.post(`${BACKEND_API}/follow/all`, { owner: owner }).then((res) => {
      dispatch({
        type: GET_FOLLOW,
        payload: res.data,
      });
    });
  } catch (err) {
    console.log("Get Follow ", err);
  }
};
