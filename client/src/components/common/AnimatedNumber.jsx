import { useEffect, useState } from "react";

function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 0,
  separator = true,
  suffix = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    let animationFrame;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const currentValue = start + (value - start) * progress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);

  return (
    <>
      {separator ? Number(formatted).toLocaleString() : formatted}
      {suffix}
    </>
  );
}

export default AnimatedNumber;
