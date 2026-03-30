import { useInView } from "framer-motion";
import { useRef } from "react";

export const useScrollAnimation = (options = { once: true, margin: "-100px" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, options);

  return { ref, isInView };
};
