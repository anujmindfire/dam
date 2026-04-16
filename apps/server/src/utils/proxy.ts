import http from "http";
import { Request, Response } from "express";
import { logger, commonMsg } from "@dam/shared";

/**
 * Simple HTTP proxy to forward requests from the Gateway to microservices.
 * @param targetHost - The destination host (e.g., 'localhost')
 * @param targetPort - The destination port (e.g., 8001)
 */
export const proxyRequest = (targetHost: string, targetPort: number) => {
  return (req: Request, res: Response) => {
    const options = {
      hostname: targetHost,
      port: targetPort,
      path: req.originalUrl,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.on("error", (err) => {
      logger.error(`[Gateway] Proxy Error [${targetPort}]:`, err);
      res.status(502).json({
        success: false,
        message: commonMsg.badGateway,
      });
    });

    req.pipe(proxyReq, { end: true });
  };
};
