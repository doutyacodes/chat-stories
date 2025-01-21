"use client"
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'react-hot-toast';
// import { genreOptions } from './genreOptions';  // Adjust the path based on your file structure

const genreOptions = {
  "3-5": [
    { value: "Any", description: "A broad selection of age-appropriate stories for children." },
    { value: "Informative Story", description: "Engaging stories that introduce simple facts and concepts." },
    { value: "Bedtime Stories", description: "Calm, soothing tales designed to help children wind down for sleep." },
    { value: "Animal Adventures", description: "Simple stories featuring animals on fun, friendly journeys or adventures." },
    { value: "Friendship Stories", description: "Tales that teach sharing, kindness, and empathy among friends." },
    { value: "Rhyming Stories", description: "Rhyming, rhythmic stories that support language development." },
    { value: "Fairy Tales", description: "Simplified classic tales with gentle morals." },
    { value: "Counting & Alphabet Stories", description: "Stories that incorporate numbers and letters in playful ways." },
    { value: "Fantasy & Magic", description: "Very light fantasy with magical elements like talking animals or whimsical worlds." },
    { value: "Silly Stories", description: "Playful, humorous tales with funny characters." },
    { value: "Adventure & Exploration", description: "Simple stories of curiosity and discovery." },
    { value: "Seasonal Stories", description: "Stories centered on holidays, weather changes, or seasonal activities." },
  ],
  "6-8": [
    { value: "Any", description: "A broad selection of age-appropriate stories for children." },
    { value: "Informative Story", description: "Engaging stories that introduce simple facts and concepts." },
    { value: "Bedtime Stories", description: "Calm, soothing tales designed to help children wind down for sleep." },
    { value: "Fantasy & Magic", description: "Magical tales with more imaginative elements." },
    { value: "Humor & Mischief", description: "Silly, playful stories with funny twists." },
    { value: "Animal Fables", description: "Short stories with animals, each ending in a moral." },
    { value: "Mystery", description: "Simple mysteries, such as finding lost objects." },
    { value: "Adventure Stories", description: "Characters go on small quests." },
    { value: "Superhero Tales", description: "Age-appropriate superhero stories." },
    { value: "Historical Legends", description: "Gentle retellings of folk tales." },
    { value: "Friendship & Family Stories", description: "Stories about navigating simple conflicts." },
    { value: "Nature & Science", description: "Stories that introduce basic science concepts." },
    { value: "Travel & Exploration", description: "Tales about visiting new places." },
    { value: "Everyday Adventures", description: "Stories where characters tackle school or personal goals." },
  ],
  "9-11": [
    { value: "Any", description: "A broad selection of age-appropriate stories for children." },
    { value: "Informative Story", description: "Engaging stories that introduce simple facts and concepts." },
    { value: "Bedtime Stories", description: "Calm, soothing tales designed to help children wind down for sleep." },
    { value: "Historical Fiction", description: "Stories set in different historical periods." },
    { value: "Science Fiction", description: "Light sci-fi exploring concepts like space travel." },
    { value: "Fantasy Quests", description: "More complex fantasy stories involving quests." },
    { value: "Detective & Mystery", description: "Engaging mysteries that require problem-solving." },
    { value: "Adventure & Survival", description: "Stories about surviving in the wild." },
    { value: "Mythology", description: "Stories based on myths from different cultures." },
    { value: "Coming-of-Age", description: "Stories exploring themes of self-discovery." },
    { value: "Humor & Satire", description: "Funny stories with gentle satire." },
    { value: "Real-Life Situations", description: "Stories dealing with friendship issues." },
    { value: "Sports & Competition", description: "Stories about sportsmanship." },
    { value: "Science & Technology", description: "Stories that introduce technology." },
    { value: "Magic Realism", description: "Stories blending reality and magical elements." },
  ],
  "12-17": [
    { value: "Any", description: "A broad selection of age-appropriate stories." },
    { value: "Historical Fiction", description: "Stories set in different historical periods." },
    { value: "Science Fiction", description: "Exploring advanced technologies or distant futures." },
    { value: "Fantasy Quests", description: "Complex stories involving magical journeys." },
    { value: "Detective & Mystery", description: "Stories involving problem-solving and clues." },
    { value: "Adventure & Survival", description: "Themes of endurance and exploration." },
    { value: "Mythology", description: "Classic myths and modern retellings." },
    { value: "Coming-of-Age", description: "Stories focused on self-growth and discovery." },
    { value: "Sports & Competition", description: "Stories about ambition and teamwork." },
    { value: "Magic Realism", description: "Fiction combining realistic settings with magical elements." },
  ],
  "18+": [
    { value: "Historical Fiction", description: "Deeply researched tales set in historical periods." },
    { value: "Science Fiction", description: "Advanced and speculative science-driven narratives." },
    { value: "Fantasy Quests", description: "Epic journeys in complex magical worlds." },
    { value: "Detective & Mystery", description: "Intricate plots with twists and turns." },
    { value: "Real-Life Situations", description: "Relatable stories about adult challenges." },
    { value: "Coming-of-Age", description: "Narratives on personal growth and relationships." },
    { value: "Humor & Satire", description: "Clever, witty, and sometimes darkly comic tales." },
    { value: "Magic Realism", description: "Blends of fantastical and everyday elements." },
  ],
};


// LoadingSpinner Component
const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
        <p className="mt-4 text-white text-lg">Creating your story...</p>
      </div>
    </div>
  );

const Search = () => {
  const [courseName, setCourseName] = useState("");
  const [language, setLanguage] = useState("english");
  const [ageRange, setAgeRange] = useState("3-5");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("story");
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset genre when age range changes
  useEffect(() => {
    setGenre("");
  }, [ageRange]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (!courseName) {
      toast.error("Please enter the topic to continue.");
      setIsLoading(false);
      return;
    }

    if (!genre) {
      toast.error("Please select a genre to continue.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch('/api/stories/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName,
          language,
          ageRange,
          genre,
          type: 'story'
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate story');
      }
  
      const data = await response.json();
      
      if (data.content) {
        setStory(data.content);
      } else {
        toast.error("No story found.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Error: " + (err?.message || "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    // <div className="w-full text-white bg-[#1F2937] min-h-screen">
    //   <Toaster />

    //   {!story && (
    //     <>
    //       <header className="text-center mb-8 mt-2">
    //         <h1 className="text-3xl font-bold text-[#7C3AED] roboto-bold">
    //           Magic Box
    //         </h1>
    //         <p className="mt-2 text-xs text-[#D1D5DB]">
    //           Imagine. Create Your Own Story.
    //         </p>
    //       </header>

    //       <div className="w-full flex justify-center items-center max-md:p-3 max-md:px-10">
    //         <div className="text-center w-full max-w-4xl p-1 py-4">
    //           <form onSubmit={handleSearch} className="w-full">
    //             <div className="w-full text-center mb-4">
    //               <h2 className="text-xl font-semibold max-md:w-full mb-8 items-center justify-center flex flex-wrap gap-3">
    //                 <div className="text-white">I want</div>
    //                 <Select
    //                   onValueChange={(value) => setType(value)}
    //                   value={type}
    //                   className="bg-[#4B5563] border-[#7C3AED]"
    //                 >
    //                   <SelectTrigger className="w-fit text-4xl uppercase rounded-full p-2 bg-[#4B5563] border-[#7C3AED] text-white [&>svg]:w-8 [&>svg]:h-24">
    //                     <SelectValue placeholder="Story" />
    //                   </SelectTrigger>
    //                   <SelectContent className="bg-[#374151] text-white">
    //                     <SelectGroup>
    //                       <SelectItem value="story">a Story</SelectItem>
    //                     </SelectGroup>
    //                   </SelectContent>
    //                 </Select>
    //                 <div className="text-white">about</div>
    //               </h2>

    //               <Input
    //                 type="text"
    //                 placeholder="Type the topic name here"
    //                 value={courseName}
    //                 maxLength="150"
    //                 onChange={(e) => setCourseName(e.target.value)}
    //                 className="w-full p-2 py-12 text-xl placeholder:text-lg border-[#7C3AED] rounded-xl md:rounded-lg placeholder:text-center md:mb-16 bg-[#4B5563] text-white"
    //               />
    //             </div>

    //             <div className="grid gap-2 md:gap-8 grid-cols-1">
    //               <div className="w-full text-center mb-4">
    //                 <h2 className="text-lg font-semibold mb-2 text-white">Age Range</h2>
    //                 <Select onValueChange={setAgeRange} value={ageRange}>
    //                   <SelectTrigger className="w-full border text-center bg-[#4B5563] border-[#7C3AED] rounded-lg p-2 text-white">
    //                     <SelectValue placeholder="Select age range" />
    //                   </SelectTrigger>
    //                   <SelectContent className="bg-[#374151] text-white">
    //                     <SelectGroup>
    //                       <SelectItem value="3-5">3 - 5 years</SelectItem>
    //                       <SelectItem value="6-8">6 - 8 years</SelectItem>
    //                       <SelectItem value="9-11">9 - 11 years</SelectItem>
    //                       <SelectItem value="12-17">12 - 17 years</SelectItem>
    //                       <SelectItem value="18+">18+ years</SelectItem>
    //                     </SelectGroup>
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               {/* Genre Selection */}
    //               <div className="w-full text-center mb-4">
    //                 <h2 className="text-lg font-semibold mb-2 text-white">Genre</h2>
    //                 <Select 
    //                   onValueChange={setGenre} 
    //                   value={genre}
    //                   disabled={!ageRange}
    //                 >
    //                   <SelectTrigger 
    //                     className={`w-full border text-center bg-[#4B5563] border-[#7C3AED] rounded-lg p-2 text-white ${!ageRange ? 'opacity-50 cursor-not-allowed' : ''}`}
    //                   >
    //                     <SelectValue placeholder="Select a genre" />
    //                   </SelectTrigger>
    //                   <SelectContent className="bg-[#374151] text-white max-h-[300px]">
    //                     <SelectGroup>
    //                       {ageRange && genreOptions[ageRange]?.map((genre) => (
    //                         <SelectItem 
    //                           key={genre.value} 
    //                           value={genre.value}
    //                           className="cursor-pointer hover:bg-[#4B5563]"
    //                         >
    //                           <div className="py-1">
    //                             <div className="font-medium">{genre.value}</div>
    //                             <div className="text-sm text-gray-300">{genre.description}</div>
    //                           </div>
    //                         </SelectItem>
    //                       ))}
    //                     </SelectGroup>
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               <div className="w-full text-center mb-4">
    //                 <h2 className="text-lg font-semibold mb-2 text-white">Language</h2>
    //                 <Select onValueChange={setLanguage} value={language}>
    //                   <SelectTrigger className="w-full border text-center bg-[#4B5563] border-[#7C3AED] rounded-lg p-2 text-white">
    //                     <SelectValue placeholder="English" />
    //                   </SelectTrigger>
    //                   <SelectContent className="bg-[#374151] text-white">
    //                     <SelectGroup>
    //                       <SelectItem value="english">English</SelectItem>
    //                       <SelectItem value="spanish">Spanish</SelectItem>
    //                       <SelectItem value="french">French</SelectItem>
    //                       <SelectItem value="german">German</SelectItem>
    //                       <SelectItem value="italian">Italian</SelectItem>
    //                       <SelectItem value="portuguese">Portuguese</SelectItem>
    //                     </SelectGroup>
    //                   </SelectContent>
    //                 </Select>
    //               </div>
    //             </div>

    //             <div className="w-full flex justify-center items-center mt-5">
    //               <button
    //                 type="submit"
    //                 className="bg-[#16A34A] text-white rounded-full uppercase font-semibold py-4 md:py-2 text-lg px-4 transition-all max-md:w-full md:min-w-60 hover:bg-[#15803d]"
    //               >
    //                 Generate Story
    //               </button>
    //             </div>
    //           </form>
    //         </div>
    //       </div>
    //     </>
    //   )}

    //   <div className="w-full h-full p-3 space-y-4">
    //     {story && (
    //       <>
    //         <div className="flex items-start justify-between bg-[#374151] rounded-lg w-full shadow-md p-2 relative font-bold text-xl mt-4 pb-6">
    //           <div
    //             onClick={() => setStory(null)}
    //             className="bg-[#7C3AED] p-2 rounded-full cursor-pointer"
    //           >
    //             <ChevronLeft className="text-white" />
    //           </div>
    //           <div className="flex flex-col gap-1 items-center">
    //             <div className="uppercase underline text-xl text-white">
    //               {story?.courseName}
    //             </div>
    //             <div className="uppercase text-base font-semibold text-[#D1D5DB]">
    //               {story?.type}
    //             </div>
    //             <div className="flex gap-7 items-center text-[#D1D5DB]">
    //               <div className="uppercase text-sm font-normal">
    //                 Age Range: {ageRange}
    //               </div>
    //               <div className="uppercase text-sm font-normal">
    //                 Language: {language}
    //               </div>
    //             </div>
    //           </div>
    //           <div />
    //         </div>

    //         <div className="w-full md:flex md:justify-center gap-7 text-justify md:pt-3">
    //           <div className="flex flex-col items-center space-y-4 bg-[#374151] shadow-lg rounded-lg w-full max-w-4xl p-3 py-6 relative">
    //             <div className="mt-2 w-full text-justify">
    //               <h2 className="text-3xl font-bold mb-6 text-center text-white">
    //                 {story.title}
    //               </h2>
    //               <div className="text-[#D1D5DB] mb-8">
    //                 {story.introduction?.content}
    //               </div>
    //               {story.body?.map((paragraph, index) => (
    //                 <div key={index} className="text-[#D1D5DB] mb-4">
    //                   {paragraph.content}
    //                 </div>
    //               ))}
    //               <div className="text-[#D1D5DB]">
    //                 {story.conclusion?.content || "Conclusion data is unavailable."}
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>

  <div className="w-full text-white bg-black min-h-screen">
    <Toaster />

    {!story && (
      <>
        <header className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-gray-300 roboto-bold">
            Make your own story with A.I
          </h1>
        </header>

        <div className="w-full flex justify-center items-center max-md:p-3 max-md:px-10">
          <div className="text-center w-full max-w-4xl p-1 py-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="w-full text-center mb-4">
                <Input
                  type="text"
                  placeholder="Type the topic name here"
                  value={courseName}
                  maxLength="150"
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full p-2 py-12 text-xl placeholder:text-lg border-gray-600 rounded-xl placeholder:text-center md:mb-16 bg-[#1F2937] text-white"
                />
              </div>

              <div className="grid gap-2 md:gap-8 grid-cols-1">
                <div className="w-full text-center mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-white">Age Range</h2>
                  <Select onValueChange={setAgeRange} value={ageRange}>
                    <SelectTrigger className="w-full border text-center bg-[#1F2937] border-gray-600 rounded-xl p-2 text-white">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] text-white">
                      <SelectGroup>
                        <SelectItem value="3-5">3 - 5 years</SelectItem>
                        <SelectItem value="6-8">6 - 8 years</SelectItem>
                        <SelectItem value="9-11">9 - 11 years</SelectItem>
                        <SelectItem value="12-17">12 - 17 years</SelectItem>
                        <SelectItem value="18+">18+ years</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full text-center mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-white">Genre</h2>
                  <Select 
                    onValueChange={setGenre} 
                    value={genre}
                    disabled={!ageRange}
                  >
                    <SelectTrigger 
                      className={`w-full border text-left bg-[#1F2937] border-gray-600 rounded-xl p-2 text-white ${!ageRange ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] text-white max-h-[300px]">
                      <SelectGroup>
                        {ageRange && genreOptions[ageRange]?.map((genre) => (
                          <SelectItem 
                            key={genre.value} 
                            value={genre.value}
                            className="cursor-pointer hover:bg-[#374151]"
                          >
                            <div className="py-1">
                              <div className="font-medium">{genre.value}</div>
                              <div className="text-sm text-gray-300">{genre.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full text-center mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-white">Language</h2>
                  <Select onValueChange={setLanguage} value={language}>
                    <SelectTrigger className="w-full border text-center bg-[#1F2937] border-gray-600 rounded-xl p-2 text-white">
                      <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] text-white">
                      <SelectGroup>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="portuguese">Portuguese</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="w-full flex justify-center items-center mt-5">
                <button
                  type="submit"
                  className="bg-[rgb(4,188,100)] text-white rounded-full uppercase font-semibold py-4 md:py-2 text-lg px-4 transition-all max-md:w-full md:min-w-60 hover:bg-[#15803d]"
                >
                  Generate Story
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )}

    {/* Story display section */}
    <div className="w-full h-full p-3 space-y-4 pb-20 md:pb-3">
      {story && (
        <>
          <div className="flex items-start justify-between bg-[#1F2937] rounded-lg w-full shadow-md p-2 relative font-bold text-xl mt-4 pb-6">
            <div
              onClick={() => setStory(null)}
              className="bg-[rgb(4,188,100)] p-2 rounded-full cursor-pointer"
            >
              <ChevronLeft className="text-white" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="uppercase underline text-xl text-white">
                {story?.courseName}
              </div>
              <div className="uppercase text-base font-semibold text-[#D1D5DB]">
                {story?.type}
              </div>
              <div className="flex gap-7 items-center text-[#D1D5DB]">
                <div className="uppercase text-sm font-normal">
                  Age Range: {ageRange}
                </div>
                <div className="uppercase text-sm font-normal">
                  Language: {language}
                </div>
              </div>
            </div>
            <div />
          </div>

          <div className="w-full md:flex md:justify-center gap-7 text-justify md:pt-3">
            <div className="flex flex-col items-center space-y-4 bg-[#1F2937] shadow-lg rounded-xl w-full max-w-4xl p-3 py-6 relative">
              <div className="mt-2 w-full text-justify">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                  {story.title}
                </h2>
                <div className="text-[#D1D5DB] mb-8">
                  {story.introduction?.content}
                </div>
                {story.body?.map((paragraph, index) => (
                  <div key={index} className="text-[#D1D5DB] mb-4">
                    {paragraph.content}
                  </div>
                ))}
                <div className="text-[#D1D5DB]">
                  {story.conclusion?.content || "Conclusion data is unavailable."}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>

  );
};

export default Search;