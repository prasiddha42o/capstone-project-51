const express = require("express");
const router = express.Router();
const db = require("../db");


// GET DASHBOARD DATA
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const stats = db.prepare(`
    SELECT id, username FROM users WHERE id = ?
  `).get(userId);

  if (!stats) {
    return res.status(404).json({ error: "User not found" });
  }

  const resultStats = db.prepare(`
    SELECT 
      COUNT(*) as items_identified,
      SUM(points) as total_points
    FROM results
    WHERE user_id = ?
  `).get(userId);

  const history = db.prepare(`
    SELECT * FROM results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).all(userId);

  const pie_data = db.prepare(`
    SELECT type, COUNT(*) as value
    FROM results
    WHERE user_id = ?
    GROUP BY type
  `).all(userId).map((row) => ({
    name: row.type,
    value: row.value,
    color: getColor(row.type)
  }));

  const badges = calculateBadges(resultStats.items_identified || 0);

  res.json({
    stats: {
      total_points: resultStats.total_points || 0,
      items_identified: resultStats.items_identified || 0,
      milestone: 50
    },
    pie_data,
    history,
    badges
  });
});


// UPDATE DASHBOARD (called from IdentifyPage)
router.post("/update", (req, res) => {
  const { userId, result } = req.body;

  if (!userId || !result) {
    return res.status(400).json({ error: "Missing data" });
  }

  db.prepare(`
    INSERT INTO results (user_id, type, points, name, emoji, weight, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    userId,
    result.type,
    result.points,
    result.name || "Unknown",
    result.emoji || "♻️",
    result.weight || "N/A"
  );

  res.json({ success: true });
});


// helpers
function getColor(type) {
  const map = {
    plastic: "#4F46E5",
    metal: "#10B981",
    organic: "#F59E0B",
    paper: "#3B82F6",
  };
  return map[type] || "#6B7280";
}

function calculateBadges(count) {
  return [
    { name: "Starter", emoji: "🌱", earned: count >= 1 },
    { name: "Recycler", emoji: "♻️", earned: count >= 5 },
    { name: "Eco Hero", emoji: "🏆", earned: count >= 10 },
  ];
}

module.exports = router;