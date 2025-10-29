'use client';

import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaLightbulb, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: FaRocket,
      title: "혁신적인 기술",
      description: "최신 기술로 비즈니스를 혁신합니다.",
    },
    {
      icon: FaUsers,
      title: "고객 중심",
      description: "고객의 성공이 우리의 목표입니다.",
    },
    {
      icon: FaLightbulb,
      title: "창의적 솔루션",
      description: "독창적인 아이디어로 문제를 해결합니다.",
    },
    {
      icon: FaChartLine,
      title: "지속적 성장",
      description: "함께 성장하며 가치를 창출합니다.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-150px)] bg-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center p-6 py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 relative"
        >
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
          <FaRocket className="text-6xl text-orange-600 relative z-10" />
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          혁신을 만드는 기업,{' '}
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            My Company
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
          우리는 최고의 기술력과 끊임없는 도전으로 고객과 함께 성장합니다.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/about"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            더 알아보기
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full group-hover:scale-110 transition-transform">
                <IconComponent className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
