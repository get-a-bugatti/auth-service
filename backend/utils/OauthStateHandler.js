import crypto from 'node:crypto';


function generateOauthState(intent) {
    const random = crypto.randomBytes(16).toString('hex');

    const payload = Buffer.from(JSON.stringify({ random, intent })).toString('base64url');

    const hmac = crypto.createHmac('sha256', process.env.GOOGLE_CLIENT_SECRET).update(payload).digest('base64url');

    return `${payload}.${hmac}`; 
}

function verifyOauthState(state) {
    if (!state) {
        console.error("State to be verified cannot be null.");
        return null;
    }
    const dotIdx = state.lastIndexOf('.');
    if (dotIdx === -1) return null;

    const payload = state.slice(0, dotIdx);
    const hmac = state.slice(dotIdx + 1)

    const expected = crypto.createHmac('sha256', process.env.GOOGLE_CLIENT_SECRET).update(payload).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) return null;
    
    console.log("OUtput of verifying oauth state :", JSON.parse(Buffer.from(payload, 'base64url').toString()));

    return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

export {generateOauthState, verifyOauthState}