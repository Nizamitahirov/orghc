// import React from "react";
// import Image from "next/image";
// import LogoWhiteBack from "@/assets/logowhiteback.png"
// import FaciconWhiteBack from "@/assets/faviconwhiteback.png"

// const Logo = ({ collapsed = false }) => {
//   if (!collapsed) {
//     return (
//       <div className="flex items-center">
//                <Image
//           src={LogoWhiteBack}
//           alt="Almet Holding Logo"
//           width={160}
//           height={20}
//           priority
//           className="object-contain"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center">
//         <Image
//         src={FaciconWhiteBack}
//         alt="Almet Holding Favicon"
//         width={30}
//         height={30}
//         priority
//         className="object-contain"
//       />
//     </div>
//   );
// };

// export default Logo;
import React from "react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center">
        <div className="bg-almet-sapphire text-white h-8 w-8 rounded flex items-center justify-center font-bold mr-2">
          A
        </div>
        <span className="text-gray-800 dark:text-white font-semibold">
         Your Company
        </span>
      </div>
    </Link>
  );
};

export default Logo;