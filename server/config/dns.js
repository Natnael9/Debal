import dns from 'dns';

// Force Node.js to resolve IPv4 addresses first.
// Crucial on Fedora/Linux dual-stack networks to prevent ETIMEDOUT when
// connecting to cloud services (MongoDB Atlas & Upstash Redis).
dns.setDefaultResultOrder('ipv4first');
