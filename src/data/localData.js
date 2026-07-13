export const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"];

// Municipalities per district with approximate coordinates for map centering
export const MUNICIPALITIES = {
  Kathmandu: [
    { name: "Kathmandu Metropolitan City", lat: 27.7172, lng: 85.3240 },
    { name: "Budhanilkantha Municipality", lat: 27.7583, lng: 85.3200 },
    { name: "Chandragiri Municipality", lat: 27.6533, lng: 85.2439 },
    { name: "Dakshinkali Municipality", lat: 27.5839, lng: 85.2716 },
    { name: "Gokarneshwor Municipality", lat: 27.7296, lng: 85.4007 },
    { name: "Kageshwari Manohara Municipality", lat: 27.7001, lng: 85.3898 },
    { name: "Kirtipur Municipality", lat: 27.6667, lng: 85.2833 },
    { name: "Nagarjun Municipality", lat: 27.7468, lng: 85.2716 },
    { name: "Shankharapur Municipality", lat: 27.8130, lng: 85.4240 },
    { name: "Tarakeshwar Municipality", lat: 27.7445, lng: 85.2804 },
    { name: "Tokha Municipality", lat: 27.7538, lng: 85.3159 },
  ],
  Lalitpur: [
    { name: "Lalitpur Metropolitan City", lat: 27.6580, lng: 85.3245 },
    { name: "Godawari Municipality", lat: 27.6228, lng: 85.3203 },
    { name: "Mahalaxmi Municipality", lat: 27.6765, lng: 85.3160 },
    { name: "Bagmati Rural Municipality", lat: 27.5750, lng: 85.2935 },
    { name: "Konjyoson Rural Municipality", lat: 27.5453, lng: 85.3158 },
    { name: "Mahankal Rural Municipality", lat: 27.7088, lng: 85.2256 },
  ],
  Bhaktapur: [
    { name: "Bhaktapur Municipality", lat: 27.6725, lng: 85.4285 },
    { name: "Changunarayan Municipality", lat: 27.6914, lng: 85.4072 },
    { name: "Madhyapur Thimi Municipality", lat: 27.6839, lng: 85.4250 },
    { name: "Suryabinayak Municipality", lat: 27.6829, lng: 85.4501 },
  ],
};

export const COLLECTION_DATA = {
  Kathmandu: {
    centers: [
      { name: "Municipal Waste Collection", phone: "+977-1-4123456", hours: "9:00 AM – 10:00 AM", tag: "Municipal Truck", tagClass: "tag-green", lat: 27.7067, lng: 85.3103 },
      { name: "Kathmandu Scrap Dealers (Khakori)", phone: "+977-1-4234567", hours: "9:00 AM – 6:00 PM", tag: "Local Scrap Dealers", tagClass: "tag-blue", lat: 27.7085, lng: 85.3242 },
      { name: "Teku Recycling Center", phone: "+977-1-4345678", hours: "9:00 AM – 5:00 PM", tag: "Recycling Center", tagClass: "tag-amber", lat: 27.6937, lng: 85.2874 },
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
      { name: "Lalitpur Metro Waste", phone: "+977-1-5523456", hours: "8:00 AM – 10:00 AM", tag: "Municipal Truck", tagClass: "tag-green", lat: 27.6686, lng: 85.3245 },
      { name: "Patan Scrap Collectors", phone: "+977-1-5534567", hours: "9:00 AM – 5:00 PM", tag: "Local Scrap Dealers", tagClass: "tag-blue", lat: 27.6737, lng: 85.3166 },
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
      { name: "Bhaktapur Municipality Waste", phone: "+977-1-6612345", hours: "7:00 AM – 9:00 AM", tag: "Municipal Truck", tagClass: "tag-green", lat: 27.6725, lng: 85.4285 },
    ],
    rules: [
      "Use municipality-provided bins for segregation",
      "Morning collection only — do not leave waste outside overnight",
      "Recyclables must be clean and dry",
    ],
  },
};