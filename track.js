// track.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { orderID } = req.query;

  if (!orderID) {
    return res.status(400).json({ status: 'error', message: 'Order ID is required' });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    let trackingData = [];

    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();

      if (url.includes('/index/search?orderID=') && 
          headers['content-type']?.includes('application/json')) {
        try {
          const json = await response.json();
          if (json.isOk === '1' && json.content) {
            trackingData = json.content.map(item => ({
              time: item.time,
              description: item.description
            }));
          }
        } catch (error) {
          console.error('Error parsing response:', error);
        }
      }
    });

    await page.goto(`https://www.fycargo.com/index/search?orderID=${orderID}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (trackingData.length > 0) {
      return res.json({ status: 'success', tracking_info: trackingData });
    } else {
      return res.json({ status: 'error', message: 'No tracking data found' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Tracking failed',
      error: error.message 
    });
  } finally {
    await browser.close();
  }
}