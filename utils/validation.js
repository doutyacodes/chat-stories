export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    const errors = [];
  
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };

//   // In your ProfilePage component:
// import { validatePassword } from '@/utils/validation';

// // Then in handleUpdate function, add before password update:
// if (field === 'password') {
//   const validation = validatePassword(formData.newPassword);
//   if (!validation.isValid) {
//     setFormErrors(prev => ({
//       ...prev,
//       password: validation.errors.join('\n')
//     }));
//     return;
//   }
//   // ... rest of the password update logic
// }