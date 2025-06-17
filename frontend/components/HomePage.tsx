import FeaturesSection from "./HomePage/features-section";
import FeaturedProducts from "./HomePage/featured-products";
import HeroSection from "./HomePage/hero-section";
import TrustIndicators from "./HomePage/trust-indicators";


const HomePage = () => {
    
    // if (loading) {
    //     return <div className="flex min-h-screen items-center justify-center">
    //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    //     </div>
    // }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* <Header /> */}
        <HeroSection />
        <FeaturesSection />
        <FeaturedProducts />
        <TrustIndicators />
        {/* <Footer /> */}
      </div>

    );
}

export default HomePage