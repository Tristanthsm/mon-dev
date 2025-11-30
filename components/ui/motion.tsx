"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MotionProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
}

export const FadeIn = ({ children, delay = 0, className, ...props }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className, ...props }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

export const StaggerContainer = ({ children, delay = 0, className, ...props }: MotionProps) => (
    <motion.div
        initial="hidden"
        animate="show"
        variants={{
            hidden: {},
            show: {
                transition: {
                    staggerChildren: 0.1,
                    delayChildren: delay,
                },
            },
        }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { ease: [0.21, 0.47, 0.32, 0.98] } },
        }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);
