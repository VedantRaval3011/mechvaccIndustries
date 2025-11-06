import React from "react";
import { Settings, Rocket, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CustomizationDesc = () => {
  const featureCards = [
    { text: "With Scalable Solutions", icon: Settings, ariaLabel: "Scalable Solutions" },
    { text: "For Rapid Work Output", icon: Rocket, ariaLabel: "Rapid Work Output" },
    { text: "With Robust Security", icon: Shield, ariaLabel: "Robust Security" },
  ];

  return (
    <section className="bg-[#f2f8f6]" aria-labelledby="customization-heading">
      <div className="flex flex-col h-auto min-h-[50vh] py-4 mx-2 gap-4 sm:gap-6 sm:mx-4 md:gap-8 md:mx-5 md:min-h-[60vh] lg:flex-row lg:justify-between lg:h-[60vh] lg:mx-16 lg:gap-6 xl:h-[65vh] xl:mx-16 2xl:h-[90vh] 3xl:h-[70vh] 3xl:mx-36">
        {/* Text Section */}
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:mt-20 lg:gap-6">
          <h1 
            id="customization-heading"
            className="uppercase text-xl font-semibold leading-tight sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl 3xl:text-7xl"
          >
            Customizing <br /> products to{" "}
            <span className="relative">
              your{" "}
              <span className="absolute left-px text-[var(--color-green)]" aria-hidden="true">
                your
              </span>
            </span>{" "}
            <br /> needs
          </h1>
          <p className="text-xs sm:text-sm md:text-lg lg:w-80 xl:w-96 2xl:text-xl 3xl:text-2xl 3xl:w-[25rem]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
            imperdiet sed id elementum. Quam vel aliquam sit vulputate. Faucibus
            nec gravida ipsum pulvinar vel.
          </p>
          <div>
            <Link href="/enquiry">
              <button 
                className="bg-[var(--color-green)] hover:shadow-2xl hover:scale-105 transition-all text-white text-base sm:text-lg md:text-xl md:p-2.5 lg:text-3xl lg:p-3 rounded-xl cursor-pointer text-center p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:ring-offset-2"
                aria-label="Enquire about custom products"
              >
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
            alt="Mechvacc company logo"
            loading="lazy"
            sizes="(max-width: 1024px) 0px, (max-width: 1280px) 256px, (max-width: 1920px) 288px, 384px"
          />
        </div>

        {/* Feature Cards */}
        <div className="flex flex-row gap-3 sm:gap-4 md:gap-8 lg:flex-col lg:gap-6 lg:my-10" role="list">
          {featureCards.map((card, index) => (
            <div
              key={index}
              role="listitem"
              className="relative flex-1 flex items-center justify-center border-[var(--color-green)] border-2 p-3 sm:p-4 md:p-6 lg:p-6 rounded-2xl text-center shadow-md size-36 sm:size-40 md:size-44 lg:size-42"
              aria-label={card.ariaLabel}
            >
              <card.icon
                className="opacity-10 sm:size-20 md:size-28 lg:size-24 3xl:size-36 text-[var(--color-green)]"
                size={64}
                aria-hidden="true"
              />
              <p className="absolute font-semibold text-[10px] sm:text-xs md:text-base lg:text-sm 3xl:text-xl">
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
    </section>
  );
};

export default CustomizationDesc;