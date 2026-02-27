// Health check endpoint for Vercel deployment monitoring
export default function handler(req, res) {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    status: 'healthy'
  };

  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = 'ERROR';
    healthCheck.status = 'unhealthy';
    res.status(503).json(healthCheck);
  }
}