import Brands from "@/components/home/Brands";
import CustomizationDesc from "@/components/home/CustomizationDesc";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedServices from "@/components/home/FeaturedServices";
import Intoduction from "@/components/home/Intoduction";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <div className="z-20">
      <Intoduction />
      <Brands />
      <FeaturedProducts />
      <WhyChooseUs />
      <FeaturedServices />
      <CustomizationDesc />
    </div>
  );
}
