import React from "react";
import { Settings, Rocket, Shield } from "lucide-react"; // Import Lucide icons
import Image from "next/image";
import Link from "next/link";

const CustomizationDesc = () => {
  // Define card data with text and icons
  const featureCards = [
    { text: "With Scalable Solutions", icon: Settings },
    { text: "For Rapid Work Output", icon: Rocket },
    { text: "With Robust Security", icon: Shield },
  ];

  return (
    <div className="bg-[#f2f8f6]">
      <div className="flex flex-col h-auto min-h-[50vh] py-4 mx-2 gap-6 md:gap-8 md:mx-5 md:min-h-[60vh] lg:flex-row lg:justify-between lg:h-[60vh] lg:mx-16 lg:gap-6 xl:h-[65vh] xl:mx-16 2xl:h-[90vh] 3xl:h-[70vh] 3xl:mx-36">
        {/* Text Section */}
        <div className="flex flex-col gap-4 md:gap-6 lg:mt-20 lg:gap-6">
          <h1 className="uppercase text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 3xl:text-7xl">
            Customizing <br /> products to{" "}
            <span className="relative">
              your{" "}
              <span className="absolute left-px text-[var(--color-green)]">
                your
              </span>
            </span>{" "}
            <br /> needs
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:w-80 xl:w-96 2xl:text-xl 3xl:text-2xl 3xl:w-[25rem]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
            imperdiet sed id elementum. Quam vel aliquam sit vulputate. Faucibus
            nec gravida ipsum pulvinar vel.
          </p>
          <div>
            <Link href='/enquiry'>
            <button className="bg-[var(--color-green)] hover:shadow-2xl hover:scale-105 transition-all text-white text-lg rounded-xl cursor-pointer text-center p-2 sm:text-xl md:p-2.5 lg:text-3xl lg:p-3">
              Enquire Now
            </button>
            </Link>
          </div>
        </div>

        {/* Logo Image (Visible only on lg and above) */}
        <div className="hidden lg:block lg:absolute lg:mt-44 lg:right-[16rem] xl:right-[29rem] 3xl:right-[36rem]">
          <Image
            width={200}
            height={200}
            className="filter lg:size-64 xl:size-72 3xl:size-96"
            style={{ filter: "drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5))" }}
            src="/mechvacc-logo.png"
            alt="logo"
          />
        </div>

        {/* Feature Cards */}
        <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 lg:flex-col lg:gap-6 lg:my-10 ">
          {featureCards.map((card, index) => (
            <div
              key={index}
              className="relative flex-1 flex items-center justify-center border-[var(--color-green)] border-2 p-4 sm:p-5 md:p-6 lg:p-6 rounded-2xl text-center shadow-md size-42"
            >
              <card.icon
                className="opacity-10 sm:size-24 md:size-28 lg:size-24 3xl:size-36 text-[var(--color-green)]"
                size={80} // Base size for mobile
              />
              <p className="absolute font-semibold text-xs sm:text-sm md:text-base lg:text-sm 3xl:text-xl">
                {card.text.split(" ").map((word, i) => (
                  <React.Fragment key={i}>
                    {word} {i === 0 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomizationDesc;