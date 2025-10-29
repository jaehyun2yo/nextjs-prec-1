'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="flex items-center justify-center"
      >
        <Image
          src="/logoBox.svg"
          alt="Logo Box"
          width={400}
          height={280}
          className="w-64 md:w-96 h-auto"
          priority
        />
      </motion.div>
    </div>
  );
}
