"use client";
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import styles from "./styles/introduction.module.css"

const Intoduction = () => {
  const texts =["Manufacturing","lorem","ipsum"]
  const images = ["/demo-1.jpg", "/demo-2.jpg", "/demo-3.jpg"];
  const [imageNumber, setImageNumber] = useState(0);
  const [fade, setFade] = useState(true);
  const [textNumber, setTextNumber] = useState(0);
  const [textFade, setTextFade] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setTextFade(false);
      setTimeout(() => {
        setTextNumber((prevTextNumber) => (prevTextNumber + 1) % texts.length);
        setTextFade(true)
      },500)
    },5000)

    return () => clearInterval(interval); 
  },[])

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setImageNumber((prevImageNumber) => (prevImageNumber + 1) % images.length);
        setFade(true); // fade in
      }, 500); 
    }, 5000);

    return () => clearInterval(interval); // Clean up 
  }, []);
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:px-7 md:mb-10 md:pt-10 lg:pt-8 xl:h-3/4 xl:mb-16 3xl:h-[63.75vh]">
      <div className="absolute inset-0 bg-[url('/wave.jpg')]  bg-center z-[-1]"></div> 
      <div className="text-xl md:text-2xl lg:text-3xl xl:text-5xl md:mt-24 px-3 md:px-0 uppercase mt-2 flex flex-col gap-0.5 z-20 3xl:text-6xl">
        <div >
          We Provide Effective and <br />{" "}
          <span className="text-[var(--color-green)] font-bold">
            TOP-NOTCH <span className={`transition-opacity duration-500 ${textFade ? 'opacity-100' : 'opacity-0'}`}>{texts[textNumber]}</span>
          </span>{" "}
          <br /> Services
        </div>
        <div className="font-medium">On-time. On-BUDGET. ON-POINT.</div>
        <div>
          <button className={`cursor-pointer flex gap-1 2xl:gap-4 bg-[var(--color-green)] text-white px-3 py-2 rounded-3xl text-base mt-1 uppercase xl:text-xl xl:px-4 3xl:px-6 xl:py-2.5 3xl:py-4 xl:mt-7 3xl:text-2xl ${styles.hoverAnimation} `}>
            <div>Contact US</div>
            <Send className={`${styles.send} 3xl:size-7`} />
            {/* <Send className={`${styles.send} hidden 2xl:block`} size={45}/> */}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Image
            src={images[imageNumber]}
          width={200}
          height={200}
          alt="Background image"
          className={`w-svw h-80 object-cover md:w-64 md:mr-10 md:h-96 md:rounded-xl shadow-lg lg:w-72 lg:h-full xl:w-96 xl:mr-10 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'} `}
        />
      </div>
    </div>
  );
};

export default Intoduction;
