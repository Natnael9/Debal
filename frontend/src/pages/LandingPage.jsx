import React from 'react';
import bgImage from '../assets/Background.jpg';

const LandingPage = () => {
  return (
    // Main wrapper: Full screen height, white background, hidden overflow for the background shapes
    <div className="relative min-h-screen bg-white overflow-hidden flex  bg-cover bg-no-repeat "
    style={{ backgroundImage: `url(${bgImage})`  } }>
      
      

      {/* CONTENT LAYER: The text and button from the previous step */}
      {/* relative z-10 keeps it stacked on top of the background image */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-10 pb-12 md:px-16 lg:px-24  flex flex-col  h-full">
        
        <div className="max-w-2xl  md:mt-0 ">
          {/* HEADLINE */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B3954] leading-[1.1] tracking-tight mb-6 uppercase">
            Find Your Ideal <br className="hidden sm:block" />
            Co-Living <br className="hidden sm:block" />
            Companion
          </h1>

          {/* SUBHEADLINE */}
          <p className="text-base sm:text-lg text-gray-700 max-w-lg mb-8 leading-relaxed font-medium">
            Our smart algorithm connects you with compatible roommates based on 
            shared habits, personality, and lifestyle. Simplify your search and 
            co-create your perfect home.
          </p>

          {/* CTA BUTTON */}
          <div className="flex">
            <button className="bg-[#2274A5] hover:bg-[#1A5C83] text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-transform duration-200 hover:scale-105 uppercase tracking-wide text-sm">
              Get Started
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;