export interface CreateBookingInput {
  checkin: string;
  checkout: string;
  guests: number;
  roomType: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface CreateMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
}