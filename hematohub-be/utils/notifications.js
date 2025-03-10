// backend/utils/notifications.js
export function sendNotification(email, message) {
    console.log(`Notification sent to ${email}: ${message}`);
    // In a real application, integrate an email or SMS service like Nodemailer, Twilio, or Firebase.
}
