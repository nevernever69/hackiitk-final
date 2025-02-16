"use client";

import { motion, useInView } from "framer-motion";
import React from "react";

const Features = () => {
  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  const ref = React.useRef(null);
  const isInView = useInView(ref);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      viewport={{ once: false }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
    >
      <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-24 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.h2
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-base font-semibold leading-7 text-muted-foreground"
          >
            Everything you need
          </motion.h2>
          <motion.p
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            What you can expect
          </motion.p>
          <motion.p
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="mt-6 text-lg leading-8"
          >
            Future Events
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Features;
