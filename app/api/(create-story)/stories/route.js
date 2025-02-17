import { NextResponse } from 'next/server';
import { STORIES, CHARACTERS, EPISODES } from '../../../../utils/schema';
import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { authenticate } from '../../../../lib/jwtMiddleware';
import { db } from '../../../../utils';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userId = authResult.decoded_Data.id;
  const localTempDir = os.tmpdir();

  try {
    // Parse the JSON body instead of formData since we're sending JSON now
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.synopsis || !data.category || !data.coverImagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    // Save story in database
    const storyRecord = await db.insert(STORIES).values({
      title: data.name,
      synopsis: data.synopsis,
      category_id: parseInt(data.category),
      story_type: data.storyType, // Hardcoded as per original code
      user_id: userId,
      cover_img: data.coverImagePath, // Use the filename from cPanel upload
      is_published: false,
    });

    const storyId = storyRecord[0].insertId;

    // Handle image upload
    // if (coverImage) {
    //   // const sftp = new SFTPClient();
    //   const sftp = new Client();
    //   await sftp.connect({
    //     host: '68.178.163.247',
    //     port: 22,
    //     username: 'devusr',
    //     password: 'Wowfyuser#123',
    //   });

    //   const localFilePath = path.join(localTempDir, fileName);
    //   const cPanelDirectory = '/home/devusr/public_html/testusr/images';

    //   if (!fs.existsSync(localTempDir)) {
    //     fs.mkdirSync(localTempDir, { recursive: true });
    //   }

    //   // Convert File object to base64
    //   const arrayBuffer = await coverImage.arrayBuffer();
    //   const buffer = Buffer.from(arrayBuffer);
    //   fs.writeFileSync(localFilePath, buffer);

    //   await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

    //   fs.unlinkSync(localFilePath);
    //   await sftp.end();
    // }

    return NextResponse.json(
      {
        message: 'Story created successfully',
        storyId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}