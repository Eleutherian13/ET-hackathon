import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedCounter({ value, prefix = "", suffix = "", delay = 0 }) {
  const [mounted, setMounted] = useState(false);
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayValue = useTransform(springValue, (current) => 
    `${prefix}${Math.round(current)}${suffix}`
  );

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => {
      springValue.set(value);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay, springValue]);

  if (!mounted) return <span>{prefix}0{suffix}</span>;

  return <motion.span>{displayValue}</motion.span>;
}
