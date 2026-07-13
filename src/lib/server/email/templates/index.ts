// Email template exports
export { generateBookingEmail, generateBookingEmailText } from './confirmation';
export { generateCancellationEmail, generateCancellationEmailText, generateAdminCancellationEmail } from './cancellation';
export { generateRescheduleEmail, generateRescheduleEmailText, generateAdminRescheduleEmail } from './reschedule';
export { generateRescheduleProposalEmail } from './reschedule-proposal';
export { generateReminderEmail, generateReminderEmailText, getDefaultReminderSubject } from './reminder';
export { generateAdminNotificationEmail } from './admin-notification';
