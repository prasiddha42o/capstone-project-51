export const DISTRICTS = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", "Butwal"
];

export const COLLECTION_DATA = {
  Kathmandu: {
    centers: [
      { name: "Municipal Waste Collection",        phone: "+977-1-4123456", hours: "9:00 AM – 10:00 AM", tag: "Municipal Truck",     tagClass: "tag-green" },
      { name: "Kathmandu Scrap Dealers (Khakori)", phone: "+977-1-4234567", hours: "9:00 AM – 6:00 PM",  tag: "Local Scrap Dealers", tagClass: "tag-blue"  },
      { name: "Teku Recycling Center",             phone: "+977-1-4345678", hours: "9:00 AM – 5:00 PM",  tag: "Recycling Center",    tagClass: "tag-amber" },
    ],
    rules: [
      "Separate organic and inorganic waste at source",
      "Municipal trucks collect waste door-to-door in the morning",
      "Plastic waste must be cleaned before disposal",
      "E-waste should be taken to designated collection centers",
      "No littering. Fines apply for violations.",
    ],
  },
  Lalitpur: {
    centers: [
      { name: "Lalitpur Metro Waste",   phone: "+977-1-5523456", hours: "8:00 AM – 10:00 AM", tag: "Municipal Truck",     tagClass: "tag-green" },
      { name: "Patan Scrap Collectors", phone: "+977-1-5534567", hours: "9:00 AM – 5:00 PM",  tag: "Local Scrap Dealers", tagClass: "tag-blue"  },
    ],
    rules: [
      "Segregate waste into organic, recyclable, and residual",
      "Collection every morning from 8–10 AM",
      "Bulky waste requires prior scheduling",
      "No burning of waste in open areas",
    ],
  },
  Bhaktapur: {
    centers: [
      { name: "Bhaktapur Municipality Waste", phone: "+977-1-6612345", hours: "7:00 AM – 9:00 AM", tag: "Municipal Truck", tagClass: "tag-green" },
    ],
    rules: [
      "Use municipality-provided bins for segregation",
      "Morning collection only — do not leave waste outside overnight",
      "Recyclables must be clean and dry",
    ],
  },
};