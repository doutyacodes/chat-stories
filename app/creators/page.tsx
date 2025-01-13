'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateStoryPage = () => {
  const router = useRouter();

  const [storyName, setStoryName] = useState('');
  const [storySynopsis, setStorySynopsis] = useState('');
  const [episodes, setEpisodes] = useState([{ name: '', synopsis: '' }]);
  const [characters, setCharacters] = useState(['']);
  const [contentLines, setContentLines] = useState([{ character: '', line: '' }]);
  const [category, setCategory] = useState('');
  const [warning, setWarning] = useState(false);

  const handlePublish = () => {
    if (warning) {
      console.log('Story published:', { storyName, storySynopsis, episodes, characters, contentLines, category });
      alert('Your story has been successfully published!');
      router.push('/home');
    } else {
      setWarning(true);
    }
  };

  const handleAddEpisode = () => {
    setEpisodes((prevEpisodes) => [...prevEpisodes, { name: '', synopsis: '' }]);
  };

  const handleRemoveEpisode = (index) => {
    setEpisodes((prevEpisodes) => prevEpisodes.filter((_, i) => i !== index));
  };

  const handleEpisodeChange = (index, field, value) => {
    setEpisodes((prevEpisodes) => {
      const updatedEpisodes = [...prevEpisodes];
      updatedEpisodes[index][field] = value;
      return updatedEpisodes;
    });
  };

  const handleAddCharacter = () => {
    setCharacters((prevCharacters) => [...prevCharacters, '']);
  };

  const handleRemoveCharacter = (index) => {
    setCharacters((prevCharacters) => prevCharacters.filter((_, i) => i !== index));
  };

  const handleCharacterChange = (index, value) => {
    setCharacters((prevCharacters) => {
      const updatedCharacters = [...prevCharacters];
      updatedCharacters[index] = value;
      return updatedCharacters;
    });
  };

  const handleAddContentLine = () => {
    setContentLines((prevContentLines) => [...prevContentLines, { character: '', line: '' }]);
  };

  const handleRemoveContentLine = (index) => {
    setContentLines((prevContentLines) => prevContentLines.filter((_, i) => i !== index));
  };

  const handleContentLineChange = (index, field, value) => {
    setContentLines((prevContentLines) => {
      const updatedContentLines = [...prevContentLines];
      updatedContentLines[index][field] = value;
      return updatedContentLines;
    });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Story</h1>

      <div className="space-y-4">
        {/* Story Name */}
        <input
          type="text"
          placeholder="Story Name"
          value={storyName}
          onChange={(e) => setStoryName(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        {/* Story Synopsis */}
        <textarea
          placeholder="Synopsis of Story"
          value={storySynopsis}
          onChange={(e) => setStorySynopsis(e.target.value)}
          className="w-full p-4 rounded bg-gray-800 text-white h-24 focus:outline-none focus:ring-2 focus:ring-purple-600"
        ></textarea>

        {/* Category Selection */}
        <div>
          <label className="text-lg font-semibold mb-2 block">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="" disabled>Select a category</option>
            <option value="Romance">Romance</option>
            <option value="Horror">Horror</option>
            <option value="Thriller">Thriller</option>
            <option value="Mystery">Mystery</option>
            <option value="Sad">Sad</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
          </select>
        </div>

        {/* Episodes */}
        <div>
          <label className="text-lg font-semibold mb-2 block">Episodes:</label>
          {episodes.map((episode, index) => (
            <div key={index} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder={`Episode ${index + 1} Name`}
                value={episode.name}
                onChange={(e) => handleEpisodeChange(index, 'name', e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <textarea
                placeholder={`Episode ${index + 1} Synopsis`}
                value={episode.synopsis}
                onChange={(e) => handleEpisodeChange(index, 'synopsis', e.target.value)}
                className="w-full p-4 rounded bg-gray-800 text-white h-24 focus:outline-none focus:ring-2 focus:ring-purple-600"
              ></textarea>
              {index > 0 && (
                <button
                  onClick={() => handleRemoveEpisode(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖ Remove Episode
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddEpisode}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            + Add Episode
          </button>
        </div>

        {/* Characters */}
        <div>
          <label className="text-lg font-semibold mb-2 block">Characters:</label>
          {characters.map((character, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                value={character}
                onChange={(e) => handleCharacterChange(index, e.target.value)}
                placeholder={`Character ${index + 1}`}
                className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {index > 0 && (
                <button
                  onClick={() => handleRemoveCharacter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddCharacter}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            + Add More Character
          </button>
        </div>

        {/* Content Section */}
        <div>
          <label className="text-lg font-semibold mb-2 block">Content:</label>
          {contentLines.map((line, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <select
                value={line.character}
                onChange={(e) => handleContentLineChange(index, 'character', e.target.value)}
                className="p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="" disabled>Select Character</option>
                {characters.map((char, charIndex) => (
                  <option key={charIndex} value={char}>
                    {char}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={line.line}
                onChange={(e) => handleContentLineChange(index, 'line', e.target.value)}
                placeholder={`Line ${index + 1}`}
                className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {index > 0 && (
                <button
                  onClick={() => handleRemoveContentLine(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddContentLine}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            + Add More Line
          </button>
        </div>

        {/* Warning and Submit */}
        {warning && (
          <p className="text-yellow-400">Are you sure you want to publish? Double-check your content!</p>
        )}
        <button
          onClick={handlePublish}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-bold text-lg mt-4"
        >
          {warning ? 'Submit Story' : 'Publish'}
        </button>
      </div>
    </div>
  );
};

export default CreateStoryPage;
