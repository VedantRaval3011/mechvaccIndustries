import Image from "next/image";
import React from "react";

const CustomizationDesc = () => {
  return (
    <div className="bg-grayBg">
      <div className="flex flex-col lg:flex-row lg:justify-between  h-[75vh] md:h-[60vh] lg:h-[60vh] py-5 md:py-3 mx-2 md:mx-5 xl:mx-16 xl:h-[65vh] gap-8 md:gap-6 2xl:h-[90vh] 3xl:h-[70vh] 3xl:mx-36">
        <div className="flex flex-col gap-1 md:gap-6  md:mt-20">
          <h1 className="uppercase text-3xl md:text-5xl xl:text-6xl 3xl:text-7xl  font-semibold">
            Customizing <br /> products to{"  "}
            <span className="relative">
              your <span className="absolute left-px text-green">your</span>
            </span>{" "}
            <br />
            needs
          </h1>
          <p className="lg:w-80 xl:w-96 2xl:text-xl 3xl:text-2xl 3xl:w-[25rem]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
            imperdiet sed id elementum. Quam vel aliquam sit vulputate. Faucibus
            nec gravida ipsum pulvinar vel.
          </p>
          <div>
            <button className="bg-green-gradient lg:text-3xl text-white text-xl rounded-xl cursor-pointer text-center p-2.5 lg:p-3">
              Enquire Now
            </button>
          </div>
        </div>
        <div className="hidden lg:block mt-44 mr-1 absolute right-[16rem] xl:right-96 3xl:right-[36rem]">
          <Image
            width={300}
            height={300}
            className="filter 3xl:size-96"
            style={{ filter: "drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5))" }}
            src="/mechvacc-logo.png"
            alt="logo"
          />
        </div>
        <div className="flex lg:flex-col justify-around gap-6 lg:gap-0 lg:my-10">
          <div className="relative flex items-center justify-center border-green border-2 p-5 md:p-7 lg:p-6 rounded-2xl sm:rounded-3xl text-center shadow-md">
            <Image
              width={100}
              height={100}
              src="/settings.png"
              className="opacity-10 3xl:size-36"
              alt=""
            />
            <p className="absolute font-semibold text-sm sm:text-base 3xl:text-xl">
              With <br /> Scalable Solutions
            </p>
          </div>
          <div className="relative flex items-center justify-center border-green border-2 p-5 md:p-7 rounded-2xl sm:rounded-3xl text-center shadow-md 2xl:gap-3">
            <Image
              width={100}
              height={100}
              src="/settings.png"
              className="opacity-10 3xl:size-36"
              alt="console"
            />
            <p className="absolute font-semibold text-sm sm:text-base 3xl:text-xl">
              With <br /> Scalable Solutions
            </p>
          </div>
          <div className="relative flex items-center justify-center border-green border-2 p-5 md:p-7 rounded-2xl sm:rounded-3xl text-center shadow-md">
            <Image
              width={100}
              height={100}
              src="/settings.png"
              className="opacity-10 3xl:size-36"
              alt=""
            />
            <p className="absolute font-semibold text-sm sm:text-base 3xl:text-xl">
              With <br /> Scalable Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationDesc;
