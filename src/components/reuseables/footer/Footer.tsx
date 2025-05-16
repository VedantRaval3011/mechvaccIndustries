import { Facebook, House, Instagram, Mail, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileViewFooter from "../home/MobileFooter";
import PolicyFooter from "../home/PolicyFooter";

const Footer = () => {
  return (
    <div className="relative h-[85vh] lg:h-[60vh] xl:h-[35vh] flex flex-col">
      <>
        <div className="flex-grow flex flex-col">
          <div className="flex pt-6 justify-between px-2 text-white bg-large-green-gradient">
            <div className="flex flex-col gap-9">
              <h1 className="lg:text-xl">
                Lorem ipsum dolor sit amet, <br /> consectetur adipiscing elit.{" "}
              </h1>
              <div className="flex gap-4">
                <Twitter />
                <Instagram />
                <Facebook />
              </div>
            </div>
            <div className="flex flex-col justify-evenly gap-6 items-center h-32 mr-2 ">
              <Link
                href="/about"
                className="bg-white rounded-2xl shadow-lg text-sm p-2"
              >
                <button className="text-black xl:text-xl">About Us</button>
              </Link>
              <div className="flex mr-2 gap-1 justify-center items-center">
                <Image
                  width={25}
                  height={25}
                  alt=""
                  src="/mechvacc-logo.png"
                  className="brightness-0 invert"
                />
                <p className="uppercase text-center"> Mechvacc </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
            <MobileViewFooter />
            <div className="hidden lg:flex gap-5 text-sm mx-3 xl:text-lg md:mt-8 font-light" style={{ WebkitFontSmoothing: 'none', textRendering: 'optimizeLegibility', }}>
              <div>
                <h2>Products</h2>
                <ul className=" py-2">
                  <li>Lorem</li>
                  <li>Ipsum</li>
                  <li>Des</li>
                  <li>All Products</li>
                </ul>
              </div>
              <div>
                <h2>Services</h2>
                <ul className=" py-2">
                  <li>Lorem</li>
                  <li>Ipsum</li>
                  <li>Des</li>
                  <li>All Services</li>
                </ul>
              </div>
              <div>
                <h2>Contact</h2>
                <ul className="py-2">
                  <li className="flex gap-1">
                    {" "}
                    <Phone size={16} /> 123-456-7890
                  </li>
                  <li className="flex gap-1">
                    <Mail size={16} /> example@mail.com
                  </li>
                  <li className="flex gap-1">
                    <House size={16} /> 123 Street, City
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-center mt-12 lg:mt-1 lg:items-center gap-16 lg:mx-4">
              <button className="bg-green-gradient rounded-2xl px-4 py-2 uppercase text-white text-lg">
                Brouchure
              </button>
              <Image
                width={150}
                height={150}
                alt=""
                src="/mechvacc-logo.png"
                className="absolute -z-10 opacity-25 filter"
                style={{
                  filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.5))",
                }}
              />
              <button className="bg-green-gradient rounded-2xl px-4 py-2 uppercase text-white text-lg">
                Book a Call
              </button>
            </div>
          </div>
        </div>
        <div className="mt-auto pb-20 lg:pb-0">
          <PolicyFooter />
        </div>
      </>
    </div>
  );
};

export default Footer;
