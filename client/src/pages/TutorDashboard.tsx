import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { format, formatDistanceToNow } from 'date-fns';
import { Users, Calendar, BookOpen, Star, AlertCircle, Plus, Clock } from 'lucide-react';

export function TutorDashboard() {
  const [activeTab, setActiveTab] = useState<'students' | 'sessions' | 'feedback'>('students');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Fetch tutor's students
  const { data: students, isLoading: studentsLoading } = trpc.tutoring.myStudents.useQuery();

  // Fetch tutor's sessions
  const { data: sessions, isLoading: sessionsLoading } = trpc.session.tutorSessions.useQuery();

  // Fetch feedback received
  const { data: feedbackReceived, isLoading: feedbackLoading } = trpc.feedback.received.useQuery();

  if (studentsLoading || sessionsLoading || feedbackLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const upcomingSessions = sessions?.filter(s => new Date(s.scheduledAt) > new Date()) || [];
  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
  const averageRating = feedbackReceived && feedbackReceived.length > 0
    ? (feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / feedbackReceived.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Tutor Dashboard</h1>
          <p className="text-slate-600">Manage your students, sessions, and track your progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{students?.length || 0}</p>
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
                <p className="text-slate-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900">{averageRating}</p>
              </div>
              <Star className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                activeTab === 'students'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              My Students ({students?.length || 0})
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
              <Star className="w-5 h-5 inline mr-2" />
              Feedback ({feedbackReceived?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'students' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Students</h3>
                {students && students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => setSelectedStudent(rel.id)}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {rel.student?.firstName} {rel.student?.lastName}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              <BookOpen className="w-4 h-4 inline mr-1" />
                              {rel.subjects} • {rel.level}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
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
                    <p className="text-slate-600">No students yet</p>
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
                                  {session.notes && (
                                    <p className="text-xs text-slate-600 mt-2 italic">Notes: {session.notes}</p>
                                  )}
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
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Feedback from Students</h3>
                {feedbackReceived && feedbackReceived.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackReceived.map((feedback) => (
                      <div key={feedback.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {feedback.comment && (
                          <p className="text-slate-700 text-sm">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No feedback yet</p>
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
