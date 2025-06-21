import type { FC } from "react";
import "./index.css";

interface MarqueeProps {}

const Marquee: FC<MarqueeProps> = () => {
  return (
    <div className="marquee">
      <div className="marquee__inner">
        <div className="marquee__group">
          <span>🔥 React </span>
          <span>✨ Electron</span>
          <span>🚀 Nest</span>
          <span>🌟 Prisma</span>
          <span>🎉 TypeScript</span>
        </div>

        <div className="marquee__group">
          <span>🔥 React </span>
          <span>✨ Electron</span>
          <span>🚀 Nest</span>
          <span>🌟 Prisma</span>
          <span>🎉 TypeScript</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
