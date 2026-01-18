import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

// Empty component
export function Empty() {
  return (
    <motion.div 
      className={cn("flex h-full items-center justify-center text-gray-500 dark:text-gray-400")} 
      onClick={() => toast('功能开发中，敬请期待')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <i className="fa-regular fa-face-smile-wink mr-2"></i> 功能开发中
    </motion.div>
  );
}