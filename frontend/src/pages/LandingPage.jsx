import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/Background.jpg';

// Helper component for smooth scroll-reveal animations
const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Stop observing once it has appeared so it doesn't repeat every time you scroll up and down
          observer.unobserve(entry.target); 
        }
      });
    }, {
      threshold: 0.1 // Triggers when 10% of the element is visible
    });
    
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="font-sans selection:bg-[#2274A5] selection:text-white scroll-smooth">
      
      {/* =========================================
          1. HERO SECTION 
      ========================================= */}
      <section 
        className="relative min-h-screen bg-white overflow-hidden flex flex-col justify-center bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] md:bg-transparent"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-12 md:px-16 lg:px-24 flex flex-col lg:flex-row items-center justify-between h-full">
          
          <div className="max-w-2xl w-full relative z-20">
            <FadeInSection>
              {/* HEADLINE */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B3954] leading-[1.1] tracking-tight mb-6 uppercase">
                Find Your Ideal <br className="hidden sm:block" />
                Co-Living <br className="hidden sm:block" />
                Companion
              </h1>
            </FadeInSection>

            <FadeInSection delay={200}>
              {/* SUBHEADLINE */}
              <p className="text-base sm:text-lg text-gray-800 md:text-gray-700 max-w-lg mb-8 leading-relaxed font-medium bg-white/60 md:bg-transparent p-4 md:p-0 rounded-xl">
                Our smart algorithm connects you with compatible roommates based on 
                shared habits, personality, and lifestyle. Simplify your search and 
                co-create your perfect home.
              </p>
            </FadeInSection>

            <FadeInSection delay={400}>
              {/* CTA BUTTON */}
              <div className="flex">
                <Link to="/signup">
                  <button className="bg-[#2274A5] hover:bg-[#1A5C83] text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 uppercase tracking-wide text-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            </FadeInSection>

            {/* MOBILE FLOATING CARDS */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 lg:hidden">
              <FadeInSection delay={600}>
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#2274A5]">
                    <span className="font-extrabold text-sm">98%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Perfect Match Found</p>
                    <p className="text-xs text-gray-500">Similar budget & habits</p>
                  </div>
                </div>
              </FadeInSection>
              
              <FadeInSection delay={800}>
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">ID Verified</p>
                    <p className="text-xs text-gray-500">Secure ecosystem</p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>

          {/* DESKTOP FLOATING CARDS */}
          <div className="hidden lg:flex flex-col gap-8 relative z-20 w-80 pointer-events-none">
            <FadeInSection delay={600}>
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white transform translate-x-8 -rotate-2 animate-[bounce_4s_infinite_alternate]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#2274A5]">
                    <span className="font-extrabold">98%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Perfect Match</p>
                    <p className="text-xs text-gray-500">Similar budget & habits</p>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={800}>
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white transform -translate-x-4 rotate-3 animate-[bounce_5s_infinite_alternate-reverse]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">ID Verified</p>
                    <p className="text-xs text-gray-500">Secure ecosystem</p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

        </div>
      </section>

      {/* =========================================
          2. ABOUT US 
      ========================================= */}
      <section className="py-24 bg-slate-50 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <FadeInSection>
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-[#2274A5] uppercase tracking-widest">About Debal</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0B3954] leading-tight">
                Bridging the housing gap.
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                With rapid urbanization and rising living costs, finding affordable housing has become a significant challenge for anyone looking to share a living space. 
              </p>
              <p className="text-gray-600 leading-relaxed">
                Traditional methods of finding roommates—like informal social media groups or bulletin boards—often lead to personality clashes, financial disputes, and security risks. 
                <strong> Debal</strong> was built to solve this. By digitizing the roommate finding process and introducing lifestyle-based matching, we ensure that you don't just find a place to stay, but a harmonious home.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-48 flex flex-col justify-end transform translate-y-8 hover:-translate-y-2 transition-transform duration-300">
                <span className="text-4xl font-extrabold text-[#2274A5] mb-2">100%</span>
                <span className="text-sm font-bold text-gray-700">Verified Profiles</span>
              </div>
              <div className="bg-[#0B3954] p-6 rounded-3xl shadow-md h-48 flex flex-col justify-end hover:-translate-y-2 transition-transform duration-300">
                <span className="text-4xl font-extrabold text-white mb-2">5+</span>
                <span className="text-sm font-medium text-blue-200">Matching Metrics</span>
              </div>
            </div>
          </FadeInSection>

        </div>
      </section>

      {/* =========================================
          3. HOW IT WORKS 
      ========================================= */}
      <section className="py-24 bg-white px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="max-w-3xl mx-auto">
          
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-[#2274A5] uppercase tracking-widest mb-2">The Process</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#0B3954]">How It Works</h3>
            </div>
          </FadeInSection>

          <div className="relative border-l-2 border-blue-100 ml-4 md:ml-12 space-y-12">
            
            <FadeInSection delay={100}>
              <div className="relative pl-10 md:pl-16">
                <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#2274A5] rounded-full border-4 border-white shadow"></div>
                <span className="text-xs font-bold text-[#2274A5] uppercase tracking-wider">Step 01</span>
                <h4 className="text-xl font-bold text-gray-900 mt-1 mb-2">Setup Your Profile</h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-4">
                  Sign up and complete our comprehensive lifestyle questionnaire. Tell us your budget constraints, preferred locations, and your habits regarding cleanliness, guests, and sleep schedules.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={200}>
              <div className="relative pl-10 md:pl-16">
                <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#2274A5] rounded-full border-4 border-white shadow"></div>
                <span className="text-xs font-bold text-[#2274A5] uppercase tracking-wider">Step 02</span>
                <h4 className="text-xl font-bold text-gray-900 mt-1 mb-2">Smart Matching</h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-4">
                  Our algorithm goes to work. Instead of endless scrolling, we instantly generate a curated feed of potential roommates who align with your specific financial and lifestyle preferences.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={300}>
              <div className="relative pl-10 md:pl-16">
                <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#2274A5] rounded-full border-4 border-white shadow"></div>
                <span className="text-xs font-bold text-[#2274A5] uppercase tracking-wider">Step 03</span>
                <h4 className="text-xl font-bold text-gray-900 mt-1 mb-2">Connect Securely</h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-4">
                  Review profiles and initiate conversations using our secure, built-in chat system. Get to know your potential roommate without having to share your personal phone number upfront.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={400}>
              <div className="relative pl-10 md:pl-16">
                <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#0B3954] rounded-full border-4 border-white shadow"></div>
                <span className="text-xs font-bold text-[#0B3954] uppercase tracking-wider">Step 04</span>
                <h4 className="text-xl font-bold text-gray-900 mt-1 mb-2">Move In Together</h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-4">
                  Once you've found the perfect match and agreed on a living arrangement, finalize your plans offline. Enjoy a harmonious living experience built on shared expectations!
                </p>
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;