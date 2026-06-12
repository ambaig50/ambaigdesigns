// pages/api/getAnalytics.js
export default async function handler(req, res) {
  // Mock analytics data (replace with real API calls)
  const analytics = [
    { platform: "Pinterest", likes: 120, shares: 45, comments: 30, saves: 80 },
    { platform: "Facebook", likes: 200, shares: 60, comments: 90, saves: 40 },
    { platform: "Instagram", likes: 500, shares: 150, comments: 200, saves: 300 },
    { platform: "Threads", likes: 350, shares: 100, comments: 120, saves: 50 }
  ];

  res.status(200).json(analytics);
}
