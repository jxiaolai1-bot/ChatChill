import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  // 认证状态管理
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        {/* 主页 - 包含所有AI微信沟通助理功能模块 */}
        <Route path="/" element={<Home />} />
        {/* 预留其他页面路由 */}
        <Route path="/other" element={<div className="text-center text-xl py-20 text-gray-500 dark:text-gray-400">
          <i className="fa-regular fa-face-smile-wink text-4xl mb-4 block"></i>
          更多功能即将上线
        </div>} />
      </Routes>
    </AuthContext.Provider>
  );
}
