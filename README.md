# BoltCare - Healthcare Appointment System

BoltCare is a modern healthcare appointment management system that connects patients with healthcare providers. It offers a seamless experience for booking, managing, and tracking medical appointments.

## Try yourself

url here

## Features

- **User Authentication**: Secure sign-in and sign-up for both patients and doctors
- **Role-based Dashboards**: Separate interfaces for patients and healthcare providers
- **Appointment Scheduling**: Easy booking system with calendar integration
- **Doctor Profiles**: Detailed information about healthcare providers
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Stay informed about appointment status changes
- **Dark Mode**: Eye-friendly interface with light/dark theme support

## Tech Stack

- **Frontend**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Next-Auth
- **Database**: Supabase
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the necessary environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
project/
├── app/                  # App router pages and layouts
│   ├── auth/             # Authentication pages
│   ├── doctor/           # Doctor dashboard and pages
│   ├── patient/          # Patient dashboard and pages
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── calendar/         # Calendar and scheduling components
│   ├── patient/          # Patient-specific components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions and configurations
├── public/               # Static assets
└── store/                # State management
```

## Environment Variables

The following environment variables are required to run the application:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXTAUTH_SECRET`: A secret key for NextAuth.js
- `NEXTAUTH_URL`: The base URL of your application

## Demo images here

 ![alt text](public\image1.png) ![alt text](public\image2.png) ![alt text](public\image3.png) ![alt text](public\image4.png) ![alt text](public\image5.png)![alt text](public\image6.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.
