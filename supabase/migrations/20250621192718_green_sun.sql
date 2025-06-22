/*
  # QuickCare Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: doctor, patient, reception)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `doctors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `specialization` (text)
      - `experience` (integer)
      - `city` (text)
      - `address` (text)
      - `phone` (text)
      - `bio` (text)
      - `consultation_fee` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `patients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `age` (integer)
      - `gender` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `appointments`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, foreign key to doctors)
      - `patient_id` (uuid, foreign key to patients)
      - `appointment_date` (date)
      - `time_slot` (text)
      - `status` (enum: scheduled, completed, no_show, cancelled)
      - `queue_position` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `reviews`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key to appointments)
      - `doctor_id` (uuid, foreign key to doctors)
      - `patient_id` (uuid, foreign key to patients)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      
    - `doctor_availability`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, foreign key to doctors)
      - `date` (date)
      - `is_available` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    
  3. Enums
    - user_role: doctor, patient, reception
    - appointment_status: scheduled, completed, no_show, cancelled
    - time_slot_enum: 09:00-11:00, 12:00-14:00, 15:00-17:00, 18:00-20:00
    - specialization_enum: Cardiac, Orthopedic, ENT, Dermatology, Pediatrics, General
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('doctor', 'patient', 'reception');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'no_show', 'cancelled');
CREATE TYPE time_slot_enum AS ENUM ('09:00-11:00', '12:00-14:00', '15:00-17:00', '18:00-20:00');
CREATE TYPE specialization_enum AS ENUM ('Cardiac', 'Orthopedic', 'ENT', 'Dermatology', 'Pediatrics', 'General');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization specialization_enum NOT NULL DEFAULT 'General',
  experience integer NOT NULL DEFAULT 0,
  city text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  bio text DEFAULT '',
  consultation_fee integer NOT NULL DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age integer,
  gender gender_enum,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  time_slot time_slot_enum NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  queue_position integer NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Doctor availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, date)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for doctors
CREATE POLICY "Anyone can read doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can update own data"
  ON doctors FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for patients
CREATE POLICY "Patients can read own data"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Patients can insert own data"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for appointments
CREATE POLICY "Users can read related appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM patients p WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for doctor availability
CREATE POLICY "Anyone can read availability"
  ON doctor_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage availability"
  ON doctor_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id::text = auth.uid()::text
    )
  );

-- Create indexes for performance
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_doctor_availability_doctor_date ON doctor_availability(doctor_id, date);

-- Insert seed data
INSERT INTO users (id, email, name, role, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'dr.smith@quickcare.com', 'Dr. Sarah Smith', 'doctor', '$2b$10$8K1p/a0dL2LKz9H1.GuEy.TR2jc8KrPiPjzjbBhNsZ9TqlKKMRU6q'),
  ('550e8400-e29b-41d4-a716-446655440002', 'dr.johnson@quickcare.com', 'Dr. Michael Johnson', 'doctor', '$2b$10$8K1p/a0dL2LKz9H1.GuEy.TR2jc8KrPiPjzjbBhNsZ9TqlKKMRU6q'),
  ('550e8400-e29b-41d4-a716-446655440003', 'dr.brown@quickcare.com', 'Dr. Emily Brown', 'doctor', '$2b$10$8K1p/a0dL2LKz9H1.GuEy.TR2jc8KrPiPjzjbBhNsZ9TqlKKMRU6q'),
  ('550e8400-e29b-41d4-a716-446655440004', 'reception@quickcare.com', 'Reception Desk', 'reception', '$2b$10$8K1p/a0dL2LKz9H1.GuEy.TR2jc8KrPiPjzjbBhNsZ9TqlKKMRU6q');

INSERT INTO doctors (user_id, specialization, experience, city, address, phone, bio, consultation_fee) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Cardiac', 8, 'New York', '123 Medical Plaza, New York, NY 10001', '+1-555-0101', 'Experienced cardiologist specializing in heart disease prevention and treatment.', 750),
  ('550e8400-e29b-41d4-a716-446655440002', 'Orthopedic', 12, 'Los Angeles', '456 Health Center, Los Angeles, CA 90210', '+1-555-0102', 'Orthopedic surgeon with expertise in joint replacement and sports medicine.', 850),
  ('550e8400-e29b-41d4-a716-446655440003', 'ENT', 6, 'Chicago', '789 Wellness Clinic, Chicago, IL 60601', '+1-555-0103', 'ENT specialist focusing on ear, nose, and throat disorders.', 650);