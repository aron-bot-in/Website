import { motion } from "framer-motion";

export default function Page({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className={`mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}
