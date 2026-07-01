import { motion } from "framer-motion";

export default function PremiumCard({
  children,
  className = "",
  hover = true,
  gradient = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`card ${hover ? "card-hover" : ""} ${gradient ? "bg-gradient-to-br" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
