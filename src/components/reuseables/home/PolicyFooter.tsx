import Link from "next/link";
import React from "react";

const PolicyFooter = () => {
  return (
    <div className="flex text-xs bg-large-green-gradient text-white justify-between ">
      <div className="flex gap-2 mx-2">
        <Link href="#" className="underline">Legal</Link>
        <Link href="#" className="underline">Privacy Center</Link>
        <Link href="#" className="underline">Privacy Policy</Link>
      </div>
      <div className="mx-2">© 2024 MECHVACC</div>
    </div>
  );
};

export default PolicyFooter;
