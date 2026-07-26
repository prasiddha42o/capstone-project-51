export const wasteCategories = {
  "plastic": {
    name: "Plastic",
    emoji: "🧴",
    type: "plastic",
    points: 10,
    instructions: "Rinse and place in the recycling bin. Remove caps if your local facility requires it.",
  },
  "paper": {
    name: "Paper",
    emoji: "📄",
    type: "paper",
    points: 8,
    instructions: "Keep dry and place in the paper recycling bin. Remove any plastic wrapping first.",
  },
  "glass": {
    name: "Glass",
    emoji: "🍾",
    type: "glass",
    points: 10,
    instructions: "Rinse and place in the glass recycling bin. Handle carefully if broken.",
  },
  "metal": {
    name: "Metal",
    emoji: "🥫",
    type: "metal",
    points: 12,
    instructions: "Rinse and place in the metal recycling bin.",
  },
  "organic": {
    name: "Organic Waste",
    emoji: "🍂",
    type: "organic",
    points: 6,
    instructions: "Place in the compost bin or organic waste collection.",
  },
  "e-waste": {
    name: "E-Waste",
    emoji: "🔌",
    type: "e-waste",
    points: 20,
    instructions: "Do not put in regular trash. Take to a certified e-waste collection point.",
  },
  "hazardous": {
    name: "Hazardous Waste",
    emoji: "☣️",
    type: "hazardous",
    points: 15,
    instructions: "Do not dispose with regular trash. Take to a designated hazardous waste facility.",
  },
  "general_trash": {
    name: "General Trash",
    emoji: "🗑️",
    type: "general_trash",
    points: 3,
    instructions: "Dispose in the general waste bin. Consider if any part could be recycled instead.",
  },
};

export function getCategoryInfo(predictedClass) {
  return (
    wasteCategories[predictedClass] || {
      name: predictedClass || "Unknown",
      emoji: "♻️",
      type: "general_trash",
      points: 5,
      instructions: "Category not recognized. Please dispose responsibly.",
    }
  );
}