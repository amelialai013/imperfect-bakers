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
  attendeeTypes?: Array<"child" | "youngAdult" | "adult">;
  skills?: string[];
}

export interface ClassConfig {
  key: string;       // stable identifier (original title)
  title: string;     // display title (editable)
  ages: string;      // e.g. "All ages", "Ages 12+"
  imageUrl: string;  // hero image URL
  description: string;
  hidden?: boolean;  // soft-delete for default classes
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
  participants?: Array<{ name: string; level: string }>;
  cancelled: boolean;
  status?: "pending" | "confirmed" | "declined";
  actionToken?: string;
  actionedAt?: string;
}
