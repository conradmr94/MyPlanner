// src/lib/emailService.js
// Simple email service for sending notifications
// In a real application, this would integrate with services like SendGrid, AWS SES, etc.

export const sendWelcomeEmail = async (userData) => {
  console.log('Sending welcome email:', userData);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Welcome email sent!'
  };
};

export const sendNotificationEmail = async (notificationData) => {
  console.log('Sending notification email:', notificationData);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Notification sent!'
  };
};
