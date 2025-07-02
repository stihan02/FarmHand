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
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white rounded-full shadow-lg px-5 py-3 font-semibold hover:bg-emerald-700 transition"
        onClick={() => setOpen(true)}
        aria-label="Send Feedback"
      >
        Feedback
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