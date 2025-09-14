import fs from 'fs';
import path from 'path';

// Simple API handler for serving Dev Doctor reports
export const serveDevDoctorReport = () => {
  try {
    const reportPath = path.join(process.cwd(), 'dev-doctor-report.json');
    
    if (!fs.existsSync(reportPath)) {
      return {
        status: 404,
        data: { 
          error: 'Report not found',
          message: 'Dev Doctor report has not been generated yet. Run "npm run dev:doctor" to create it.'
        }
      };
    }
    
    const data = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(data);
    
    return {
      status: 200,
      data: report
    };
  } catch (error) {
    console.error('Error serving Dev Doctor report:', error);
    return {
      status: 500,
      data: { 
        error: 'Internal server error',
        message: 'Failed to load Dev Doctor report'
      }
    };
  }
};