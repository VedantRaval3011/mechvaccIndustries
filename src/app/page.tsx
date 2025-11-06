"use client";

import dynamic from "next/dynamic";
import Brands from "@/components/home/Brands";
import CustomizationDesc from "@/components/home/CustomizationDesc";
import Introduction from "@/components/home/Intoduction";

// Lazy load heavy components
const FeaturedProducts = dynamic(() =>
  import(/* webpackChunkName: "featured-products" */ "@/components/home/FeaturedProducts"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading products...</div>,
  ssr: false,
});

const FeaturedServices = dynamic(() =>
  import(/* webpackChunkName: "featured-services" */ "@/components/home/FeaturedServices"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading services...</div>,
  ssr: false,
});

const WhyChooseUs = dynamic(() =>
  import(/* webpackChunkName: "why-choose-us" */ "@/components/home/WhyChooseUs"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading features...</div>,
  ssr: false,
});


export default function Home() {
  return (
    <main className="z-20">
      <Introduction />
      <Brands />
      <FeaturedProducts />
      <WhyChooseUs />
      <FeaturedServices />
      <CustomizationDesc />
    </main>
  );
}