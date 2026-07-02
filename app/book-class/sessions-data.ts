export interface Session {
  id: string;
  sessionName?: string;
  classLabel: string;
  date: string;
  time: string;
  location: string;
  price: number;
  spotsLeft: number;
  ages: string;
}

export const allSessions: Session[] = [
  {
    id: "sweet-food-jul-18",
    classLabel: "Sweet Food",
    date: "Saturday 18 July 2026",
    time: "1 – 4pm",
    location: "Williamstown, Melbourne",
    price: 150,
    spotsLeft: 15,
    ages: "18–99 yrs",
  },
  {
    id: "savoury-food-jul-18",
    sessionName: "Delicious Dinner",
    classLabel: "Savoury Food",
    date: "Saturday 18 July 2026",
    time: "5 – 8pm",
    location: "Williamstown, Melbourne",
    price: 150,
    spotsLeft: 15,
    ages: "18–99 yrs",
  },
  {
    id: "savoury-food-jul-25",
    sessionName: "Delicious Dinner",
    classLabel: "Savoury Food",
    date: "Saturday 25 July 2026",
    time: "5 – 8pm",
    location: "Williamstown, Melbourne",
    price: 150,
    spotsLeft: 15,
    ages: "18–99 yrs",
  },
  {
    id: "private-promo-jul-4",
    sessionName: "Promo class",
    classLabel: "Private Group Class",
    date: "Saturday 4 July 2026",
    time: "1 – 4pm",
    location: "Holy Trinity Church, Williamstown",
    price: 50,
    spotsLeft: 4,
    ages: "18–99 yrs",
  },
];

export const classTypeList = [
  { label: "Sweet Food",               sub: "Cakes, cookies & pastries" },
  { label: "Savoury Food",             sub: "Pasta, pizza & hearty meals" },
  { label: "Knife Skills",             sub: "Ages 12+ · Precision techniques" },
  { label: "Dietary Requirement Food", sub: "Inclusive & allergen-aware" },
  { label: "Random Kitchen Fun",       sub: "All ages · Surprise challenges" },
  { label: "Private Group Class",      sub: "Groups & special occasions" },
];

export function getSessionById(id: string): Session | undefined {
  return allSessions.find((s) => s.id === id);
}

export function getSessionsByClass(label: string): Session[] {
  return allSessions.filter((s) => s.classLabel === label);
}
