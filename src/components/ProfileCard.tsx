import React from 'react';
import { Users, Heart, Star, Coffee, Award, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileProps {
  profile: {
    name: string;
    avatar: string;
    traits: string[];
    style: string;
    emotion: string;
    interests: string[];
    relationshipStatus: string;
    statusDetail: string;
    chatFrequency: string;
    responseTime: string;
  };
}

export const ProfileCard: React.FC<ProfileProps> = ({ profile }) => {
  // 根据关系类型获取对应的颜色和图标
  const getRelationshipStyle = () => {
    switch (profile.relationshipStatus) {
      case '导师':
      case '指导关系':
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-300',
          icon: <Users className="h-4 w-4" />
        };
      case '亲密好友':
      case '多年好友':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          icon: <Heart className="h-4 w-4" />
        };
      case 'Crush':
        return {
          bgColor: 'bg-pink-100 dark:bg-pink-900/30',
          textColor: 'text-pink-700 dark:text-pink-300',
          icon: <Star className="h-4 w-4" />
        };
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: <Users className="h-4 w-4" />
        };
    }
  };

  const relationshipStyle = getRelationshipStyle();
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-700 rounded-2xl shadow-md overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 头部信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                {profile.name}
              </motion.h2>
              <motion.div 
                className="flex items-center gap-2 mt-1 flex-wrap"
                variants={itemVariants}
              >
                <div className={`${relationshipStyle.bgColor} ${relationshipStyle.textColor} px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
                  {relationshipStyle.icon}
                  <span>{profile.relationshipStatus}</span>
                </div>
                <span className="text-white/80 text-sm">{profile.statusDetail}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 特征标签 */}
      <div className="p-6">
        <motion.div 
          className="mb-6"
          variants={itemVariants}
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">核心特征</h3>
          <div className="flex flex-wrap gap-2">
            {profile.traits.map((trait, index) => (
              <motion.span 
                key={index} 
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-sm"
                whileHover={{ scale: 1.05, backgroundColor: '#dbeafe' }}
              >
                {trait}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* 沟通风格 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">说话风格</h4>
                <p className="font-medium">{profile.style}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center gap-2">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Heart className="h-4 w-4 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">情感倾向</h4>
                <p className="font-medium">{profile.emotion}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 兴趣和聊天数据 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={itemVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">兴趣点</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <motion.span 
                  key={index} 
                  className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-full text-sm flex items-center gap-1"
                  whileHover={{ scale: 1.05, backgroundColor: '#dcfce7' }}
                >
                  <Coffee className="h-3 w-3" />
                  {interest}
                </motion.span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">聊天数据</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{profile.chatFrequency}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{profile.responseTime}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};