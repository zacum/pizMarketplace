import React from "react";
import AvatarImage from "../avatarimage/AvatarImage";

const Owner = ({ state }) => {
  return (
    (
      <>
        <div className="main-bid-container">
          <div className="bid-avatar-image">
            <AvatarImage
              profileImg={state?.profileImg}
              nft={state?.nft}
            />
          </div>
          <div className="bid-description">
            <h4>{state?.nft?.name}</h4>
            <h5>{state?.ownername}</h5>
          </div>
        </div>
      </>
    )
  );
};

export default Owner;
