# 🎓 College Management System

A comprehensive web-based college management system built with React, TypeScript, and Supabase. This modern application provides seamless management of events, food stalls, attendance tracking, and user authentication for both students and administrators.

## 🚀 Features

### 👨‍💼 Admin Features
- **Event Management**: Create, edit, and manage college events with image uploads
- **Food Stall Management**: Complete CRUD operations for campus food stalls with menu management
- **Attendance Tracking**: QR code-based attendance system with real-time scanning
- **User Management**: Admin registration and authentication system
- **Dashboard Analytics**: Overview of events, attendance, and food stall performance

### 👨‍🎓 Student Features
- **Event Browser**: View and register for upcoming college events
- **Food Ordering**: Browse food stalls and place orders
- **QR Code Generation**: Generate personal QR codes for attendance
- **Profile Management**: Update personal information and preferences
- **Payment Integration**: Secure payment processing for events and food orders

### 🔧 Technical Features
- **File Upload System**: Image upload with preview for events and food stalls
- **QR Scanner**: Real-time QR code scanning with camera permissions
- **Offline Mode**: Graceful fallback when database is unavailable
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data synchronization with Supabase
- **Type Safety**: Full TypeScript implementation for better code quality

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **QR Code**: html5-qrcode library
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd college-management-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a Supabase project
   - Run the SQL schema from `database-schema.sql`
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profiles with role-based access
- **events**: College events with details and images
- **food_stalls**: Campus food stalls with menus
- **attendance**: Event attendance records
- **orders**: Food orders and payments

## 🎯 Usage

### For Administrators

1. **Login**: Access admin panel with admin credentials
2. **Create Events**: 
   - Navigate to Event Management
   - Click "Add Event"
   - Upload event image and fill details
   - Set date, time, and capacity
3. **Manage Food Stalls**:
   - Go to Food Stall Management
   - Add new stalls with images and menus
   - Update pricing and availability
4. **Track Attendance**:
   - Use QR scanner for real-time attendance
   - Export attendance reports
   - Monitor event participation

### For Students

1. **Registration**: Create student account with roll number
2. **Browse Events**: View upcoming events and register
3. **Food Ordering**: Browse stalls and place orders
4. **Generate QR**: Create QR code for attendance marking
5. **Profile**: Update personal information and preferences

## 🔐 Authentication

The system supports multiple authentication methods:

- **Email/Password**: Traditional login system
- **OTP Login**: SMS-based authentication
- **Role-based Access**: Separate admin and student portals
- **Session Management**: Secure session handling with timeouts

## 📱 Mobile Support

- Responsive design works on all screen sizes
- Camera access for QR code scanning
- Touch-friendly interface
- Progressive Web App (PWA) ready

## 🔧 Configuration

### Offline Mode
The application automatically falls back to offline mode when:
- Supabase credentials are not configured
- Network connectivity issues occur
- Database is temporarily unavailable

### Camera Permissions
QR scanner requests proper camera permissions:
- Automatic back camera selection on mobile
- Permission denial handling
- Fallback options for unsupported devices

## 🚀 Deployment

### Build the application
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy the `dist` folder

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- File uploads are currently stored as data URLs (implement proper file storage for production)
- QR scanner requires HTTPS in production for camera access
- Some features require Supabase configuration for full functionality

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with college ERP systems
- [ ] Advanced reporting features
- [ ] Multi-language support

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🙏 Acknowledgments

- React team for the amazing framework
- Supabase for backend infrastructure
- Tailwind CSS for styling system
- All contributors and testers

---

**Built with ❤️ for modern college management**
