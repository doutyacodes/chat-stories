// app/api/generate-story/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
    try {
      const { courseName, language, ageRange, type = "story" } = await req.json();
  
      // Input validation
      if (!courseName || !language || !ageRange) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
  
      const prompt = `
      Create a JSON object for a story on the topic of "${courseName}" in "${language}" for the age range of "${ageRange}".
      The story should be engaging and age-appropriate.
      
      Structure:
      {
        "courseName": "${courseName}",
        "language": "${language}",
        "ageRange": "${ageRange}",
        "type": "${type}",
        "title": "Story Title",
        "introduction": {
          "content": "Introduction to set the scene or introduce main characters."
        },
        "body": [
          {
            "content": "Each main paragraph of the story in sequence."
          }
        ],
        "conclusion": {
          "content": "Ending or moral of the story."
        }
      }
    `;
  
      // Make request to OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 5000,
          // temperature: 0.7, // Add some creativity while maintaining coherence
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      let responseText = response.data.choices[0].message.content.trim();
      responseText = responseText.replace(/```json|```/g, "").trim();  
      let storyData = null; // Declare outside try-catch block
      try {
        storyData = JSON.parse(responseText);
        console.log(storyData);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        // Handle the error or return a fallback response
        return NextResponse.json(
          { error: "Failed to parse the story response" },
          { status: 500 }
        );
      }
  
      // Return the generated story data
      return NextResponse.json({ content: storyData }, { status: 200 });
  
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
  
      return NextResponse.json(
        { 
          error: "Failed to generate story", 
          details: error.message 
        }, 
        { status: 500 }
      );
    }
  }
  