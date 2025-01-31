'use client';

import { useState } from 'react';

export default function FileUploadTest() {
    const [videoFile, setVideoFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [videoResponse, setVideoResponse] = useState(null);
    const [audioResponse, setAudioResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e, type) => {
        if (type === 'video') {
            setVideoFile(e.target.files[0]);
        } else {
            setAudioFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file, type) => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append(type === 'video' ? 'videoFile' : 'audioFile', file);

        const uploadUrl = type === 'video'
            ? 'https://wowfy.in/testusr/upload2.php'
            : 'https://wowfy.in/testusr/audioUpload.php';

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (type === 'video') {
                setVideoResponse(data);
            } else {
                setAudioResponse(data);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 pt-28">
            <h2 className="text-xl font-semibold">Test Audio & Video Upload</h2>
            
            <div>
                <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                <button
                    onClick={() => uploadFile(videoFile, 'video')}
                    disabled={loading || !videoFile}
                    className="bg-blue-500 text-white px-4 py-2 mt-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload Video'}
                </button>
                {videoResponse && <p>{JSON.stringify(videoResponse)}</p>}
            </div>
            
            <div>
                <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
                <button
                    onClick={() => uploadFile(audioFile, 'audio')}
                    disabled={loading || !audioFile}
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload Audio'}
                </button>
                {audioResponse && <p>{JSON.stringify(audioResponse)}</p>}
            </div>
        </div>
    );
}
