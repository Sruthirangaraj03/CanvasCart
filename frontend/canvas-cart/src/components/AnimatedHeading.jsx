import { motion } from "framer-motion";

const AnimatedHeading = ({ text }) => {
  const letters = text.split("");

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 8, stiffness: 50 },
    },
  };

  return (
    <motion.h1
      className="text-4xl md:text-5xl font-bold text-white mb-6 flex flex-wrap justify-center drop-shadow-lg"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {letters.map((char, i) => (
        <motion.span key={i} variants={child}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default AnimatedHeading;
