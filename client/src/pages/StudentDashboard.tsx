import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { format, formatDistanceToNow } from 'date-fns';
import { Users, Calendar, BookOpen, Star, AlertCircle, MessageSquare, Clock } from 'lucide-react';

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'tutors' | 'sessions' | 'feedback'>('tutors');
  const [feedbackToGive, setFeedbackToGive] = useState<{ sessionId: number; tutorId: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Fetch student's tutors
  const { data: tutors, isLoading: tutorsLoading } = trpc.tutoring.myTutors.useQuery();

  // Fetch student's sessions
  const { data: sessions, isLoading: sessionsLoading } = trpc.session.studentSessions.useQuery();

  // Fetch feedback received
  const { data: feedbackReceived, isLoading: feedbackLoading } = trpc.feedback.received.useQuery();

  // Submit feedback mutation
  const submitFeedback = trpc.feedback.submit.useMutation();

  if (tutorsLoading || sessionsLoading || feedbackLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const upcomingSessions = sessions?.filter(s => new Date(s.scheduledAt) > new Date()) || [];
  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];

  const handleSubmitFeedback = async () => {
    if (!feedbackToGive) return;
    try {
      await submitFeedback.mutateAsync({
        sessionId: feedbackToGive.sessionId,
        toUserId: feedbackToGive.tutorId,
        rating,
        comment: comment || undefined,
      });
      setFeedbackToGive(null);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Student Dashboard</h1>
          <p className="text-slate-600">Track your tutoring sessions and progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">My Tutors</p>
                <p className="text-3xl font-bold text-slate-900">{tutors?.length || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{upcomingSessions.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{completedSessions.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Feedback Given</p>
                <p className="text-3xl font-bold text-slate-900">{feedbackReceived?.length || 0}</p>
              </div>
              <Star className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('tutors')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'tutors'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              My Tutors ({tutors?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'sessions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Sessions ({sessions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'feedback'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Give Feedback
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tutors' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Tutors</h3>
                {tutors && tutors.length > 0 ? (
                  <div className="space-y-4">
                    {tutors.map((rel) => (
                      <div
                        key={rel.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {rel.tutor?.name}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              <BookOpen className="w-4 h-4 inline mr-1" />
                              {rel.subjects} &bull; {rel.level}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Email: {rel.tutor?.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              Status: <span className="font-medium text-green-600">{rel.status}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">
                              Started {formatDistanceToNow(new Date(rel.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No tutors assigned yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Sessions</h3>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Upcoming */}
                    {upcomingSessions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-500" />
                          Upcoming
                        </h4>
                        <div className="space-y-2 mb-6">
                          {upcomingSessions.map((session) => (
                            <div
                              key={session.id}
                              className="p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-slate-900">{session.subject}</p>
                                  <p className="text-sm text-slate-600">
                                    {format(new Date(session.scheduledAt), 'PPP p')}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">Duration: {session.duration} min</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  {session.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed */}
                    {completedSessions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                          Completed
                        </h4>
                        <div className="space-y-2">
                          {completedSessions.map((session) => (
                            <div
                              key={session.id}
                              className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-slate-900">{session.subject}</p>
                                  <p className="text-sm text-slate-600">
                                    {format(new Date(session.scheduledAt), 'PPP p')}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
                                  Completed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No sessions scheduled</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Give Feedback to Your Tutors</h3>
                {feedbackToGive ? (
                  <div className="p-6 border border-blue-200 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-4">Submit Feedback</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              onClick={() => setRating(r)}
                              className={`p-2 rounded transition-colors ${
                                rating >= r
                                  ? 'bg-amber-400 text-white'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              <Star className="w-5 h-5" fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Comments (optional)</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts about the session..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={submitFeedback.isPending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                        <button
                          onClick={() => setFeedbackToGive(null)}
                          className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {completedSessions.length > 0 ? (
                      <div className="space-y-3">
                        {completedSessions.map((session) => (
                          <div
                            key={session.id}
                            className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:bg-slate-50"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{session.subject}</p>
                              <p className="text-sm text-slate-600">
                                {format(new Date(session.scheduledAt), 'PPP p')}
                              </p>
                            </div>
                            <button
                              onClick={() => setFeedbackToGive({ sessionId: session.id, tutorId: session.tutorId })}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Give Feedback
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No completed sessions to give feedback on</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

