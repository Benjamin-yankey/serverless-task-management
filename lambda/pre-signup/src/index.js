/**
 * Cognito Pre-Signup trigger to restrict user registrations to allowed email domains.
 * @param {Object} event - Cognito trigger event
 * @returns {Object} - Updated Cognito event
 */
exports.handler = async (event) => {
  console.log('Pre-Signup Trigger Event:', JSON.stringify(event, null, 2));
  
  const { email } = event.request.userAttributes;
  const allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(',').map(d => d.trim().toLowerCase());
  
  if (!email) {
    throw new Error('Email attribute is required for signup');
  }
  
  const emailDomain = email.split('@')[1].toLowerCase();
  
  if (!allowedDomains.includes(emailDomain)) {
    console.error(`Rejected signup for domain: ${emailDomain}. Allowed domains: ${allowedDomains.join(', ')}`);
    throw new Error(`Email domain ${emailDomain} is not allowed. Please use your Amalitech email.`);
  }
  
  console.log(`Accepted signup for email: ${email}`);
  
  // Return the event to Cognito to proceed with signup
  return event;
};
