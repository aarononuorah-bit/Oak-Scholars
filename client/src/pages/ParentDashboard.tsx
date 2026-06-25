import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { format, formatDistanceToNow } from 'date-fns';
import { Users, Calendar, BookOpen, Star, AlertCircle, ChevronRight, Clock } from 'lucide-react';

export function ParentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'tutors'>('overview');

  // Fetch parent's children (students linked to parent account)
  // This would require a new API endpoint to get children for a parent
  // For now, we'll show a placeholder
  const children: any[] = []; // Would be populated from API

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Parent Dashboard</h1>
          <p className="text-slate-600">Monitor your child's tutoring progress and sessions</p>
        </div>

        {/* Child Selection */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Your Child</h2>
          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    selectedChildId === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{child.firstName} {child.lastName}</p>
                  <p className="text-sm text-slate-600 mt-1">Grade: {child.grade || 'N/A'}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No children linked to your account yet</p>
              <p className="text-sm text-slate-500 mt-2">Contact support to link your child's account</p>
            </div>
          )}
        </div>

        {selectedChildId && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Assigned Tutors</p>
                    <p className="text-3xl font-bold text-slate-900">2</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Upcoming Sessions</p>
                    <p className="text-3xl font-bold text-slate-900">3</p>
                  </div>
                  <Calendar className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed Sessions</p>
                    <p className="text-3xl font-bold text-slate-900">8</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg Tutor Rating</p>
                    <p className="text-3xl font-bold text-slate-900">4.8</p>
                  </div>
                  <Star className="w-10 h-10 text-amber-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
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
                  Sessions
                </button>
                <button
                  onClick={() => setActiveTab('tutors')}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === 'tutors'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  Tutors
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Learning Progress</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-slate-900">Mathematics</p>
                          <span className="text-sm text-slate-600">8 sessions</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Tutor: Mr. Johnson</p>
                      </div>

                      <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-slate-900">English Literature</p>
                          <span className="text-sm text-slate-600">5 sessions</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Tutor: Ms. Smith</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Sessions</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">Mathematics - Algebra</p>
                            <p className="text-sm text-slate-600">Today at 3:00 PM</p>
                            <p className="text-xs text-slate-500 mt-2">Tutor: Mr. Johnson</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Upcoming
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">English - Essay Writing</p>
                            <p className="text-sm text-slate-600">Yesterday at 4:30 PM</p>
                            <p className="text-xs text-slate-500 mt-2">Tutor: Ms. Smith</p>
                            <p className="text-xs text-slate-600 mt-2 italic">
                              Notes: Good progress on essay structure. Keep practicing!
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">Mathematics - Geometry</p>
                            <p className="text-sm text-slate-600">2 days ago at 2:00 PM</p>
                            <p className="text-xs text-slate-500 mt-2">Tutor: Mr. Johnson</p>
                          </div>
                          <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tutors' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Child's Tutors</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">Mr. James Johnson</h4>
                            <p className="text-sm text-slate-600 mt-1">Mathematics Specialist</p>
                            <p className="text-xs text-slate-500 mt-2">Email: james.johnson@tutors.com</p>
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < 5 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-slate-600 ml-2">(4.9/5)</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">Ms. Sarah Smith</h4>
                            <p className="text-sm text-slate-600 mt-1">English Literature Expert</p>
                            <p className="text-xs text-slate-500 mt-2">Email: sarah.smith@tutors.com</p>
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-slate-600 ml-2">(4.7/5)</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
