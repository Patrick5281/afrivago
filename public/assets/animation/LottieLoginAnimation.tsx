import React from "react";
import Lottie from "lottie-react";
import animationData from "AnimLogin.json"; // adapte si ton chemin est différent

const LottieLoginAnimation = () => {
  return (
    <div className="w-full h-full">
      <Lottie
      animationData={animationData}
      loop={true}
      style={{ width: 480, height: 480 }}
      />
</div>
  );
};

export default LottieLoginAnimation;
