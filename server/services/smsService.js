require('dotenv').config();

// Initialize Twilio client only if credentials exist
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken && accountSid !== 'your_twilio_account_sid') {
  client = require('twilio')(accountSid, authToken);
}

const sendSmsOtp = async (to, otpCode) => {
  if (!client) {
    console.warn('[MOCK SMS] Twilio client not configured. Showing in console instead.');
    console.log(`[SMS to ${to}]: Mã xác thực MindHub của bạn là ${otpCode}. Mã có hiệu lực trong ${process.env.OTP_EXPIRES_IN_MINUTES || 5} phút.`);
    return true; // Simulate success for dev environment without actual Twilio
  }

  try {
    const message = await client.messages.create({
      body: `Mã xác thực MindHub của bạn là ${otpCode}. Mã có hiệu lực trong ${process.env.OTP_EXPIRES_IN_MINUTES || 5} phút. Tuyệt đối không chia sẻ mã này.`,
      from: fromPhone,
      to: to
    });
    console.log('SMS sent:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

module.exports = {
  sendSmsOtp
};
