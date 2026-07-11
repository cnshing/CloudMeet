// Email template exports
export { generateBookingEmail, generateBookingEmailText } from './confirmation';
export { generateCancellationEmail, generateAdminCancellationEmail } from './cancellation';
export { generateRescheduleEmail, generateAdminRescheduleEmail } from './reschedule';
export { generateRescheduleProposalEmail } from './reschedule-proposal';
export { generateReminderEmail, getDefaultReminderSubject } from './reminder';
export { generateAdminNotificationEmail } from './admin-notification';
