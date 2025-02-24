import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SignInRequiredDialog = ({ showAuthDialog, setShowAuthDialog, actionType, router }) => {
  return (
    <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <AlertDialogContent className="bg-white dark:bg-gray-800 max-w-md rounded-lg shadow-lg">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Sign in required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-base">
            You need to sign in to {actionType} this story. Would you like to sign in now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 mt-6">
          <AlertDialogCancel 
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            onClick={() => setShowAuthDialog(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={() => router.push('/login')}
          >
            Sign In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SignInRequiredDialog;