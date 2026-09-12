// server/middleware/authMiddleware.js
import admin from '../config/firebaseAdmin.js';

/**
 * Verifies the Firebase ID token sent in the Authorization header
 * ("Authorization: Bearer <idToken>"), and attaches the verified
 * identity to req.uid / req.email / req.firebaseUser.
 *
 * This replaces trusting a uid sent in the request body/params/localStorage,
 * which anyone could forge with devtools or curl.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.uid = decoded.uid;
    req.email = decoded.email;
    req.firebaseUser = decoded;

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Same as verifyFirebaseToken, but doesn't fail the request if no/invalid
 * token is present — just leaves req.uid undefined. Useful for routes that
 * are public but behave differently for logged-in users.
 */
export const optionalFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.email = decoded.email;
    req.firebaseUser = decoded;
  } catch (err) {
    // ignore invalid token on optional routes
  }
  next();
};
