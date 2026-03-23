import React from "react";

const HeroBanner = () => {
    return (
        <div className="relative isolate w-full overflow-hidden rounded-lg-drd bg-gradient-to-br from-primary to-primary-dark">
            <div className="flex items-center min-h-[160px] sm:min-h-[200px] lg:min-h-[260px]">
                {/* Left — Text */}
                <div className="relative z-10 flex-1 px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                    <p className="text-overline font-bold tracking-widest text-white/55 mb-2 sm:mb-3">
                        YOUR KNOWLEDGE EMPIRE
                    </p>
                    <h2 className="text-lg sm:text-xl lg:text-h2 font-heading font-bold text-white leading-tight">
                        Transform Any Material
                        <br />
                        <span className="text-white/90">
                            Into an Interactive Adventure
                        </span>
                    </h2>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-body-sm text-white/65 max-w-md leading-relaxed hidden sm:block">
                        Upload any PDF, video, or article — AI transforms it
                        into a structured learning journey just for you.
                    </p>
                </div>

                {/* Right — Illustration */}
                <div className="hidden sm:flex items-end justify-end flex-shrink-0 w-[40%] lg:w-[42%] self-end">
                    <img
                        src="/fvi.webp"
                        alt="Scholar learning illustration"
                        className="w-full h-auto max-h-[200px] lg:max-h-[300px] object-contain object-bottom drop-shadow-none select-none pointer-events-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Subtle background circles */}
            <div className="absolute top-1/2 right-[30%] -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white/[0.04] pointer-events-none" />
            <div className="absolute top-4 right-[55%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/[0.06] pointer-events-none" />
        </div>
    );
};

export default HeroBanner;
