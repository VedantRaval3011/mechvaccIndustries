import React from "react";
import styles from "./styles/brands.module.css";
import Image from "next/image";

const imagesInfo = [
  { src: "/logos/3m.svg", alt: "3M Logo", id: 1 },
  { src: "/logos/barstool-store.svg", alt: "Barstool", id: 2 },
  { src: "/logos/budweiser.svg", alt: "Budweiser", id: 3 },
  { src: "/logos/buzzfeed.svg", alt: "Buzzfeed", id: 4 },
  { src: "/logos/forbes.svg", alt: "Forbes", id: 5 },
  { src: "/logos/macys.svg", alt: "Macys", id: 6 },
  { src: "/logos/menshealth.svg", alt: "Menshealth", id: 7 },
  { src: "/logos/mrbeast.svg", alt: "Mr Beast", id: 8 },
  { src: "/logos/3m.svg", alt: "3M Logo", id: 9 },
  { src: "/logos/barstool-store.svg", alt: "Barstool", id: 10 },
  { src: "/logos/budweiser.svg", alt: "budwiser", id: 11 },
  { src: "/logos/buzzfeed.svg", alt: "Buzzfeed", id: 12 },
  { src: "/logos/forbes.svg", alt: "Forbes", id: 13 },
  { src: "/logos/macys.svg", alt: "Macys", id: 14 },
  { src: "/logos/menshealth.svg", alt: "mansHealth", id: 15 },
  { src: "/logos/mrbeast.svg", alt: "Mr. beast", id: 16 },
];
const Brands = () => {
  return (
    <div className="bg-large-green-gradient z-20  border-white">
      <div className="flex md:pt-10 pt-5 uppercase items-center ml-2 md:ml-7  font-medium text-white">
        <span className="text-sm md:text-3xl lg:text-4xl font-bold">
          {" "}
          Relied Upon by Brands{" "}
        </span>{" "}
        <span className="text-sm md:text-4xl font-normal ml-1">|</span>{" "}
        <br className="md:hidden" />
        <span className="text-sm md:text-2xl text-center ml-1">
          AROUND THE WORLD
        </span>
      </div>
      <div className={`${styles.logos} `}>
        <div className={`${styles.logosSlide} flex`}>
          {imagesInfo.map((item) => (
            <Image
              className="invert w-44"
              src={`${item.src}`}
              alt={`${item.alt}`}
              width={150}
              height={150}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;
