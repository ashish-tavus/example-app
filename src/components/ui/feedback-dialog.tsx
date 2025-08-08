'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FeedbackDialogProps {
  conversationId: string;
  onClose: () => void;
  onFeedbackSubmit: (feedback: 'yes' | 'no', additionalFeedback?: string, email?: string) => Promise<void>;
}

type DialogState = 'feedback' | 'yes-details' | 'no-details' | 'success' | 'error';

export function FeedbackDialog({ conversationId, onClose, onFeedbackSubmit }: FeedbackDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleYesFeedback = () => {
    setDialogState('yes-details');
  };

  const handleNoFeedback = () => {
    setDialogState('no-details');
  };

  const handleYesSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onFeedbackSubmit('yes', additionalFeedback, email);
      setSuccessMessage('Thank you for your feedback! We\'ve recorded that your issue was resolved.');
      setDialogState('success');
    } catch (error) {
      console.error('Error submitting positive feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      setDialogState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onFeedbackSubmit('no', additionalFeedback, email);
      setSuccessMessage('Thank you for your feedback! We\'ve recorded the issue and will work to improve our service.');
      setDialogState('success');
    } catch (error) {
      console.error('Error submitting negative feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      setDialogState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const renderFeedbackScreen = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          How was your experience?
        </h2>
        <p className="text-sm text-gray-600">
          Did we resolve your issue today?
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
        <p className="text-sm text-gray-700">
          <strong>Conversation ID:</strong> <span className="font-mono text-blue-600">{conversationId}</span>
        </p>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={handleYesFeedback}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Yes, it helped!</span>
        </Button>
        
        <Button
          onClick={handleNoFeedback}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 border-red-300 hover:bg-red-50 text-red-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <XCircle className="w-5 h-5" />
          <span>No, I need help</span>
        </Button>
      </div>
    </div>
  );

  const renderYesDetailsScreen = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Great! Thanks for the feedback
        </h2>
        <p className="text-sm text-gray-600">
          Any additional comments? (Optional)
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800">
          <strong>Conversation ID:</strong> <span className="font-mono">{conversationId}</span>
        </p>
      </div>

      <div className="mb-4">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email (Optional)
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="feedback" className="text-sm font-medium text-gray-700">
          Additional Comments (Optional)
        </Label>
        <textarea
          id="feedback"
          value={additionalFeedback}
          onChange={(e) => setAdditionalFeedback(e.target.value)}
          placeholder="Any additional feedback or suggestions..."
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDialogState('feedback')}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleYesSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </Button>
      </div>
    </div>
  );

  const renderNoDetailsScreen = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Tell us more
        </h2>
        <p className="text-sm text-gray-600">
          What went wrong or what could we improve?
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Conversation ID:</strong> <span className="font-mono">{conversationId}</span>
        </p>
      </div>

      <div className="mb-4">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email (Optional)
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="feedback" className="text-sm font-medium text-gray-700">
          Describe the Issue (Optional)
        </Label>
        <textarea
          id="feedback"
          value={additionalFeedback}
          onChange={(e) => setAdditionalFeedback(e.target.value)}
          placeholder="Please describe what went wrong or what you were trying to accomplish..."
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDialogState('feedback')}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleNoSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Sending...' : 'Submit Feedback'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Thank You!
      </h2>
      <p className="text-gray-600 mb-6">
        {successMessage}
      </p>
      <Button 
        onClick={handleClose}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Close
      </Button>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-6">
        {errorMessage}
      </p>
      <div className="flex space-x-3">
        <Button 
          onClick={() => setDialogState('feedback')}
          variant="outline"
          className="flex-1"
        >
          Try Again
        </Button>
        <Button 
          onClick={handleClose}
          className="flex-1"
        >
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
      {dialogState === 'feedback' && renderFeedbackScreen()}
      {dialogState === 'yes-details' && renderYesDetailsScreen()}
      {dialogState === 'no-details' && renderNoDetailsScreen()}
      {dialogState === 'success' && renderSuccessScreen()}
      {dialogState === 'error' && renderErrorScreen()}
    </div>
  );
}
