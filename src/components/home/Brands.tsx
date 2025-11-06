import React from "react";
import styles from "./styles/brands.module.css";
import Image from "next/image";

const imagesInfo = [
  { src: "/logos/3m.svg", alt: "3M trusted partner", id: 1 },
  { src: "/logos/barstool-store.svg", alt: "Barstool Store trusted partner", id: 2 },
  { src: "/logos/budweiser.svg", alt: "Budweiser trusted partner", id: 3 },
  { src: "/logos/buzzfeed.svg", alt: "BuzzFeed trusted partner", id: 4 },
  { src: "/logos/forbes.svg", alt: "Forbes trusted partner", id: 5 },
  { src: "/logos/macys.svg", alt: "Macy's trusted partner", id: 6 },
  { src: "/logos/menshealth.svg", alt: "Men's Health trusted partner", id: 7 },
  { src: "/logos/mrbeast.svg", alt: "Mr Beast trusted partner", id: 8 },
  { src: "/logos/3m.svg", alt: "3M trusted partner", id: 9 },
  { src: "/logos/barstool-store.svg", alt: "Barstool Store trusted partner", id: 10 },
  { src: "/logos/budweiser.svg", alt: "Budweiser trusted partner", id: 11 },
  { src: "/logos/buzzfeed.svg", alt: "BuzzFeed trusted partner", id: 12 },
  { src: "/logos/forbes.svg", alt: "Forbes trusted partner", id: 13 },
  { src: "/logos/macys.svg", alt: "Macy's trusted partner", id: 14 },
  { src: "/logos/menshealth.svg", alt: "Men's Health trusted partner", id: 15 },
  { src: "/logos/mrbeast.svg", alt: "Mr Beast trusted partner", id: 16 },
];

const Brands = () => {
  return (
    <section className="bg-large-green-gradient z-20 border-white" aria-labelledby="brands-heading">
      <div className="flex md:pt-10 pt-5 uppercase items-center ml-2 md:ml-7 font-medium text-white">
        <h2 
          id="brands-heading"
          className="text-sm md:text-3xl lg:text-4xl font-bold"
        >
          Relied Upon by Brands
        </h2>
        <span className="text-sm md:text-4xl font-normal ml-1" aria-hidden="true">|</span>
        <span className="text-sm md:text-2xl text-center ml-1">
          AROUND THE WORLD
        </span>
      </div>
      <div className={`${styles.logos}`} role="img" aria-label="Scrolling logos of trusted brand partners">
        <div className={`${styles.logosSlide} flex`}>
          {imagesInfo.map((item) => (
            <Image
              className="invert w-44"
              src={item.src}
              alt={item.alt}
              width={150}
              height={150}
              key={item.id}
              loading="lazy"
              sizes="176px"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;