'use client';

import { Suspense } from 'react';
import CreateStoryForm from './CreateStoryForm';

export default function CreateStoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateStoryForm />
    </Suspense>
  );
}