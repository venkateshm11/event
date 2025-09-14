import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, MapPin, Phone, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeGenerator from 'qrcode';

interface PaymentModalProps {
  event: any;
  onClose: () => void;
  onPaymentSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ event, onClose, onPaymentSuccess, showAlert }) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'spot'>('upi');
  const [step, setStep] = useState<'method' | 'payment' | 'processing'>('method');
  const [upiQR, setUpiQR] = useState<string>('');
  const [formData, setFormData] = useState({
    // UPI Data
    upiId: '',
    
    // Card Data
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Net Banking
    bankName: '',
    
    // Spot Registration
    spotName: '',
    spotRollNumber: '',
    spotEmail: '',
    spotPhone: ''
  });

  const eventPrice = event.price || 100; // Default price if not set
  const upiMerchantId = 'micfest@paytm'; // Sample UPI ID

  const generateUPIQR = async () => {
    try {
      const upiString = `upi://pay?pa=${upiMerchantId}&pn=Mic%20Fest&am=${eventPrice}&cu=INR&tn=Event%20Registration%20${event.title}`;
      const qrCodeDataUrl = await QRCodeGenerator.toDataURL(upiString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        }
      });
      setUpiQR(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate UPI QR:', error);
    }
  };

  React.useEffect(() => {
    if (paymentMethod === 'upi' && step === 'payment') {
      generateUPIQR();
    }
  }, [paymentMethod, step]);

  const handlePayment = async () => {
    setStep('processing');
    
    // Simulate payment processing with potential failure
    const shouldFail = Math.random() < 0.1; // 10% chance of failure for testing
    
    setTimeout(() => {
      if (shouldFail) {
        showAlert('⚠️ Payment Failed, Try Again', 'error');
        setStep('method'); // Go back to payment method selection
      } else {
        // Add payment to user's history
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser.id) {
          const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
          if (userIndex !== -1) {
            if (!users[userIndex].paymentHistory) {
              users[userIndex].paymentHistory = [];
            }
            
            const payment = {
              eventId: event.id,
              eventTitle: event.title,
              amount: eventPrice,
              date: new Date().toISOString(),
              status: 'completed',
              transactionId: `TXN${Date.now()}`,
              paymentMethod: paymentMethod.toUpperCase()
            };
            
            users[userIndex].paymentHistory.push(payment);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
          }
        }
        
        showAlert('✅ Payment Successful! Registration confirmed! 🎉', 'success');
        onPaymentSuccess();
        onClose();
      }
    }, 2000);
  };

  const paymentMethods = [
    { id: 'upi' as const, label: 'UPI Payment', icon: Smartphone, color: 'bg-green-500' },
    { id: 'card' as const, label: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'netbanking' as const, label: 'Net Banking', icon: Building, color: 'bg-purple-500' },
    { id: 'spot' as const, label: 'Spot Registration', icon: MapPin, color: 'bg-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Event Registration Payment</h3>
            <p className="text-gray-600">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{eventPrice}</p>
                <p className="text-sm text-gray-600">Registration Fee</p>
              </div>
            </div>
          </div>

          {step === 'method' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800">Choose Payment Method</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${method.color} mr-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{method.label}</p>
                          <p className="text-sm text-gray-600">
                            {method.id === 'upi' && 'Pay using UPI apps'}
                            {method.id === 'card' && 'Visa, Mastercard, Rupay'}
                            {method.id === 'netbanking' && 'All major banks'}
                            {method.id === 'spot' && 'Register at venue'}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('payment')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
              >
                Continue with {paymentMethods.find(m => m.id === paymentMethod)?.label}
              </motion.button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* UPI Payment */}
              {paymentMethod === 'upi' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">UPI Payment</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* UPI ID Method */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-700">Pay with UPI ID</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter UPI ID
                        </label>
                        <input
                          type="text"
                          value={formData.upiId}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="yourname@paytm"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePayment}
                        disabled={!formData.upiId}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                      >
                        Pay ₹{eventPrice}
                      </motion.button>
                    </div>

                    {/* QR Code Method */}
                    <div className="text-center">
                      <h5 className="font-medium text-gray-700 mb-4">Scan QR Code</h5>
                      {upiQR ? (
                        <div>
                          <img
                            src={upiQR}
                            alt="UPI QR Code"
                            className="mx-auto bg-white p-4 rounded-lg shadow-md border mb-4"
                          />
                          <p className="text-sm text-gray-600 mb-4">
                            Scan with any UPI app to pay ₹{eventPrice}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePayment}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
                          >
                            I've Paid ₹{eventPrice}
                          </motion.button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                          <p className="text-gray-600 mt-2">Generating QR Code...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Card Payment</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Name on card"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                  >
                    Pay ₹{eventPrice}
                  </motion.button>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Net Banking</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Bank
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    >
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                      <option value="union">Union Bank</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      🔒 You will be redirected to your bank's secure login page to complete the payment.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={!formData.bankName}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    Proceed to {formData.bankName.toUpperCase()} Net Banking
                  </motion.button>
                </div>
              )}

              {/* Spot Registration */}
              {paymentMethod === 'spot' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">Spot Registration</h4>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-800 mb-2">📍 Register at Venue</h5>
                    <p className="text-orange-700 text-sm">
                      Complete your registration directly at the event venue on the day of the event.
                    </p>
                  </div>

                  {/* Registration Form */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-700">Pre-fill Registration Details</h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.spotName}
                        onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.spotRollNumber}
                        onChange={(e) => setFormData({ ...formData, spotRollNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.spotEmail}
                        onChange={(e) => setFormData({ ...formData, spotEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.spotPhone}
                        onChange={(e) => setFormData({ ...formData, spotPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  {/* Admin Contact Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-3">📞 Contact Admin for Assistance</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-blue-700">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Event Coordinator: Rahul Sharma</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>+91 98765 43210</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>events@micfest.edu</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Registration Desk - Main Campus, Ground Floor</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">📋 Spot Registration Process</h5>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li>1. Visit the registration desk 30 minutes before event</li>
                      <li>2. Bring valid student ID and fee (₹{eventPrice})</li>
                      <li>3. Fill the registration form at the venue</li>
                      <li>4. Make payment and collect your entry pass</li>
                    </ol>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!formData.spotName || !formData.spotRollNumber || !formData.spotEmail || !formData.spotPhone) {
                        showAlert('⚠️ Please fill all registration details', 'error');
                        return;
                      }
                      showAlert('✅ Spot registration details saved! Visit the venue to complete registration. 📍', 'success');
                      onClose();
                    }}
                    disabled={!formData.spotName || !formData.spotRollNumber || !formData.spotEmail || !formData.spotPhone}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 disabled:opacity-50"
                  >
                    Save Registration Details
                  </motion.button>
                </div>
              )}

              <button
                onClick={() => setStep('method')}
                className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                ← Back to payment methods
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment...</h4>
              <p className="text-gray-600">Please wait while we confirm your payment</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;