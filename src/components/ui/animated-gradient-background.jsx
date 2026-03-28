import { motion } from "motion/react";
import { useEffect, useRef } from "react";

const AnimatedGradientBackground = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    "#050508",
    "#1a1040",
    "#2d1b69",
    "#1e3a8a",
    "#312e81",
    "#1e1b4b",
    "#0f0f1a",
  ],
  gradientStops = [30, 45, 58, 68, 78, 88, 100],
  animationSpeed = 0.015,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let animationFrame;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      if (!Breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(", ");

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] } }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div ref={containerRef} style={containerStyle} className="absolute inset-0" />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
