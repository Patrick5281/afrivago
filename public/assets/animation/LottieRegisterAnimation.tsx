import React from "react";
import Lottie from "lottie-react";
import animationData from "AnimRegister.json"; // adapte si ton chemin est différent

const LottieRegisterAnimation = () => {
  return (
    <div className="w-full h-[531px]">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default LottieRegisterAnimation;
