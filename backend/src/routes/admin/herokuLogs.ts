import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../authenticateJWT';
import { requireAdminRole } from '../../middleware/requireAdminRole';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Get Heroku application logs
router.get('/heroku-logs', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      lines = 100, 
      source, 
      dyno, 
      tail = 'false',
      level = 'info' 
    } = req.query;

    const herokuApiToken = process.env.HEROKU_API_TOKEN;
    const herokuAppName = process.env.HEROKU_APP_NAME || 'kustodia-backend';

    if (!herokuApiToken) {
      res.status(200).json({ 
        logs: [],
        totalLines: 0,
        filteredLines: 0,
        message: 'Heroku API token not configured. To enable live log monitoring, set HEROKU_API_TOKEN environment variable.',
        configurationRequired: true
      });
      return;
    }

    console.log('[ADMIN] Fetching Heroku logs for app:', herokuAppName);

    // Build logplex URL parameters
    const logParams = new URLSearchParams({
      lines: String(lines),
      tail: String(tail)
    });

    // Add optional filters
    if (source) logParams.append('source', String(source));
    if (dyno) logParams.append('dyno', String(dyno));

    // Get log session from Heroku Platform API
    const sessionResponse = await axios.post(
      `https://api.heroku.com/apps/${herokuAppName}/log-sessions`,
      {
        lines: parseInt(String(lines)),
        tail: tail === 'true'
      },
      {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const logUrl = sessionResponse.data.logplex_url;
    console.log('[ADMIN] Got log session URL from Heroku');

    // Fetch actual logs from logplex URL
    const logsResponse = await axios.get(logUrl, {
      timeout: 15000,
      responseType: 'text'
    });

    const rawLogs = logsResponse.data;
    
    // Parse and format logs
    const logLines = rawLogs.split('\n').filter((line: string) => line.trim());
    const formattedLogs = logLines.map((line: string) => {
      // Parse Heroku log format: timestamp source[dyno]: message
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2})\s+(\w+)\[([^\]]+)\]:\s*(.*)$/);
      
      if (match) {
        const [, timestamp, source, dyno, message] = match;
        return {
          timestamp: new Date(timestamp),
          formattedTimestamp: new Date(timestamp).toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Mexico_City'
          }),
          source,
          dyno,
          message: message.trim(),
          level: getLogLevelFromMessage(message),
          rawLine: line
        };
      } else {
        // Fallback for unparseable lines
        return {
          timestamp: new Date(),
          formattedTimestamp: new Date().toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City'
          }),
          source: 'unknown',
          dyno: 'unknown',
          message: line,
          level: 'info',
          rawLine: line
        };
      }
    });

    // Filter by level if specified
    const filteredLogs = level && level !== 'all' 
      ? formattedLogs.filter((log: any) => log.level === level)
      : formattedLogs;

    res.json({
      logs: filteredLogs,
      totalLines: logLines.length,
      filteredLines: filteredLogs.length,
      appName: herokuAppName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching Heroku logs:', error);
    
    if (error.response) {
      // Heroku API error
      res.status(error.response.status || 500).json({
        error: 'Heroku API error',
        message: error.response.data?.message || error.message,
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      res.status(504).json({
        error: 'Request timeout',
        message: 'Heroku logs request timed out'
      });
    } else {
      // Other errors
      res.status(500).json({
        error: 'Failed to fetch Heroku logs',
        message: error.message
      });
    }
  }
});

// Get Heroku dyno information (root route for frontend)
router.get('/', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const herokuApiToken = process.env.HEROKU_API_TOKEN;
    const herokuAppName = process.env.HEROKU_APP_NAME || 'kustodia-backend';

    if (!herokuApiToken) {
      res.status(200).json({ 
        dynos: [],
        message: 'Heroku API token not configured. To enable dyno monitoring, set HEROKU_API_TOKEN environment variable.',
        configurationRequired: true
      });
      return;
    }

    const response = await axios.get(
      `https://api.heroku.com/apps/${herokuAppName}/dynos`,
      {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        timeout: 10000
      }
    );

    const dynos = response.data.map((dyno: any) => ({
      id: dyno.id,
      name: dyno.name,
      type: dyno.type,
      size: dyno.size,
      state: dyno.state,
      created_at: dyno.created_at,
      updated_at: dyno.updated_at,
      command: dyno.command
    }));

    res.json({
      dynos,
      appName: herokuAppName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching Heroku dynos:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch Heroku dynos',
      message: error.message
    });
  }
});

// Get Heroku dyno information (legacy route)
router.get('/heroku-dynos', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const herokuApiToken = process.env.HEROKU_API_TOKEN;
    const herokuAppName = process.env.HEROKU_APP_NAME || 'kustodia-backend';

    if (!herokuApiToken) {
      res.status(200).json({ 
        dynos: [],
        message: 'Heroku API token not configured. To enable dyno monitoring, set HEROKU_API_TOKEN environment variable.',
        configurationRequired: true
      });
      return;
    }

    const response = await axios.get(
      `https://api.heroku.com/apps/${herokuAppName}/dynos`,
      {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        timeout: 10000
      }
    );

    const dynos = response.data.map((dyno: any) => ({
      id: dyno.id,
      name: dyno.name,
      type: dyno.type,
      size: dyno.size,
      state: dyno.state,
      created_at: dyno.created_at,
      updated_at: dyno.updated_at,
      command: dyno.command
    }));

    res.json({
      dynos,
      appName: herokuAppName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching Heroku dynos:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch Heroku dynos',
      message: error.message
    });
  }
});

// Helper function to determine log level from message content
function getLogLevelFromMessage(message: string): 'error' | 'warn' | 'info' | 'debug' {
  const lowerMessage = message.toLowerCase();
  const log = message as string;
  const levelNum = log.includes('[ERROR]') ? 3 : log.includes('[WARN]') ? 2 : 1;
  if (levelNum === 3 || lowerMessage.includes('fail') || lowerMessage.includes('exception')) {
    return 'error';
  }
  if (levelNum === 2 || lowerMessage.includes('warn') || lowerMessage.includes('warning')) {
    return 'warn';
  }
  if (lowerMessage.includes('debug') || lowerMessage.includes('trace')) {
    return 'debug';
  }
  
  return 'info';
}

export default router;
