import { Settings } from "lucide-react";
import Link from "next/link";

const ComingSoon = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-almet-sapphire dark:bg-almet-sapphire rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
          <Settings size={24} className="text-white animate-spin-slow" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          Coming Soon
        </h2>
        <p className="text-gray-500 dark:text-almet-bali-hai text-sm mb-4">
          We're currently developing this feature. It will be available soon.
        </p>
        <Link
          href="/"
          className="bg-almet-sapphire text-white px-3 py-1.5 rounded-md hover:bg-almet-astral dark:hover:bg-almet-sapphire/90 transition-colors inline-block text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;