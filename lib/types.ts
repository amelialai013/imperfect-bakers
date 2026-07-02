export interface ClassSession {
  id: string;
  classLabel: string;
  sessionName: string;
  date: string;        // "Saturday 18 July 2026"
  time: string;        // "1 – 4pm"
  location: string;
  price: number;
  maxSpots: number;
  spotsLeft: number;
  ages: string;        // "18–99 yrs"
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  sessionId: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  counts: {
    child: number;
    youngAdult: number;
    adult: number;
  };
  totalPeople: number;
  paymentStatus: string;
  paymentOther?: string;
  notes: string;
  cancelled: boolean;
}
