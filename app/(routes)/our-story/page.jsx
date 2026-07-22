'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const OurStoryPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-10">
      {/* Hero */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/8 via-black to-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
        
        <div className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <img
              src="/Transparentlogo.png"
              alt="Ping Tales"
              className="mx-auto w-44 md:w-56 mb-10"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Stories that live<br />beyond the screen.
            </h1>
            <p className="text-white/40 text-lg md:text-xl max-w-lg mx-auto">
              Read, watch, listen, play — and sometimes, get up and move.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="space-y-8 text-white/70 text-base md:text-[17px] leading-[1.85] text-justify">
          <p>
            A story can be a lot of things. It can be a chat conversation that 
            unfolds message by message, the way your best friend would tell you 
            something wild that happened last night. It can be a series of images 
            that set the mood before a single word is spoken. It can be a voice 
            note that pulls you in, or a video clip that drops you right into the 
            middle of the action. On Ping Tales, stories aren't locked into one 
            format — they use all of them together.
          </p>

          <p>
            That's what makes this different. A story here might start with a 
            photo, shift into a chat between two characters, pause for a voiceover 
            that changes everything, and then hit you with a short clip you didn't 
            see coming. It feels alive because it uses every way we already 
            communicate — images, text, audio, video — layered into one experience 
            that keeps you hooked.
          </p>

          <p>
            But reading is only half of it. Some stories on Ping Tales are games. 
            You're following along, getting deep into the plot, and then a quiz 
            shows up — answer it right and you unlock the next episode. Or the 
            story gives you a real-life challenge: walk a thousand steps before 
            you can continue, because your character is on the run. Or it tells 
            you to reach an actual location in your city, because the next chapter 
            only unlocks when you get there. The story doesn't just stay on your 
            phone. It spills into your real world.
          </p>

          <p>
            And anyone can build this. You don't need to be a developer or a 
            filmmaker. If you have a story to tell, Ping Tales gives you the 
            tools to tell it in any way you want — chats, images, audio, video, 
            quizzes, real-world challenges, all of it. The platform is as much 
            for creators as it is for readers and players.
          </p>
        </div>
      </div>

      {/* What makes it different — flowing text, not a feature list */}
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500/40 via-orange-500/20 to-transparent rounded-full" />
          <div className="pl-6 md:pl-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Stories meet real life
            </h2>
            <p className="text-white/60 text-base md:text-[17px] leading-[1.85] text-justify">
              Most storytelling apps keep you sitting still. Ping Tales does the 
              opposite when the story calls for it. Imagine reading a thriller 
              where the detective needs to get to a safehouse — and your app tells 
              you to walk 2,000 steps before the next chapter opens. Or a treasure 
              hunt that sends you to a park bench in your neighborhood because 
              that's where the clue is hidden. The line between the story and your 
              life blurs on purpose. That's not a feature we added on top. That's 
              the kind of storytelling we built this whole thing for.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6 py-14 md:py-20 text-center">
        <p className="text-white/35 text-base md:text-lg mb-8">
          Curious? Jump in and see for yourself.
        </p>
        <button
          onClick={() => router.push('/stories')}
          className="bg-white text-black font-semibold px-10 py-4 rounded-full 
            text-base hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
        >
          Explore Stories
        </button>
      </div>
    </div>
  );
};

export default OurStoryPage;
