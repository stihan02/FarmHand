import React, { useState } from 'react';

export const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSend = () => {
    const mailto = `mailto:stihancoetzee0@gmail.com?subject=HerdWise Feedback&body=${encodeURIComponent(feedback)}`;
    window.open(mailto, '_blank');
    setOpen(false);
    setFeedback('');
  };

  return (
    <>
      <button
        className="fixed bottom-20 right-6 z-30 bg-emerald-600 text-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-xl hover:bg-emerald-700 transition"
        onClick={() => setOpen(true)}
        aria-label="Send Feedback"
        title="Send Feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v7.125c0 .621.504 1.125 1.125 1.125h2.25m10.5-8.25v7.125c0 .621-.504 1.125-1.125 1.125h-2.25m-6.75 0h6.75" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-emerald-700">Send Feedback</h2>
            <textarea
              className="w-full border rounded p-2 mb-4 min-h-[100px]"
              placeholder="Your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300"
                onClick={handleSend}
                disabled={!feedback.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 