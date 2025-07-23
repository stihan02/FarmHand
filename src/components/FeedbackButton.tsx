import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Send, X, CheckCircle } from 'lucide-react';
import { useToast } from './ToastContext';

interface FeedbackData {
  userId?: string;
  userEmail?: string;
  feedback: string;
  timestamp: any;
  userAgent: string;
  url: string;
}

export const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSend = async () => {
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create feedback data
      const feedbackData: FeedbackData = {
        userId: user?.uid,
        userEmail: user?.email || undefined,
        feedback: feedback.trim(),
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store in Firestore
      await addDoc(collection(db, 'feedback'), feedbackData);

      // Send email notification (using a simple mailto as fallback)
      const emailSubject = 'HerdWise Feedback - New User Feedback';
      const emailBody = `
New feedback received from HerdWise:

User: ${user?.email || 'Anonymous'}
Feedback: ${feedback.trim()}
Time: ${new Date().toLocaleString()}
URL: ${window.location.href}

---
This feedback was submitted through the HerdWise app.
      `;
      
      const mailto = `mailto:stihancoetzee0@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailto, '_blank');

      // Show success state
      setSubmitted(true);
      setFeedback('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      setFeedback('');
      setSubmitted(false);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-20 right-6 z-30 bg-emerald-600 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-110"
        onClick={() => setOpen(true)}
        aria-label="Send Feedback"
        title="Send Feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your feedback has been submitted successfully. We'll review it and get back to you soon!
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Send Feedback
                  </h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Help us improve HerdWise! Share your thoughts, suggestions, or report any issues you've encountered.
                  </p>
                  {user && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                      Submitting as: {user.email}
                    </p>
                  )}
                </div>

                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 min-h-[120px] resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us what you think about HerdWise... What works well? What could be better? Any bugs you've found?"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  autoFocus
                  disabled={isSubmitting}
                />
                
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center gap-2"
                    onClick={handleSend}
                    disabled={!feedback.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 