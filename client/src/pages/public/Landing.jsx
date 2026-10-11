import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Clock, TrendingUp, Users, CalendarX, ArrowRight, ArrowDown } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'} />;
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      
      {/* HERO SECTION */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-4">Adaptive Service Flow</p>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Appointments change.<br/>Your schedule should too.
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
              Slotly continuously adapts appointment and queue flow when services run late, customers cancel, no-shows occur, or walk-ins arrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-6 py-4 text-base font-semibold text-white shadow hover:bg-gray-800 transition">
                Get started
              </Link>
              <a href="#how-it-works" className="inline-flex justify-center items-center rounded-lg bg-gray-50 border border-gray-200 px-6 py-4 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition">
                See how it works
              </a>
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-gray-400 tracking-wider uppercase text-xs mb-4">Today</h3>
            <div className="space-y-3 mb-6 relative opacity-50 filter grayscale">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">10:00 AM</p>
                  <p className="text-sm text-gray-500">Haircut · 20 min</p>
                </div>
                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">A-101</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">10:20 AM</p>
                  <p className="text-sm text-gray-500">Consultation · 20 min</p>
                </div>
                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">A-102</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">10:40 AM</p>
                  <p className="text-sm text-gray-500">Service · 20 min</p>
                </div>
                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">A-103</div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 via-gray-50/80 p-8 flex flex-col justify-end pt-32">
              <div className="bg-white p-5 rounded-xl border border-primary-200 shadow-lg relative mb-4">
                <div className="absolute -top-3 left-4 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded font-bold border border-primary-200">+15 min delay</div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="font-black text-primary-900">10:00 AM → 10:35 AM</p>
                    <p className="text-sm text-gray-500">A-101 actual duration</p>
                  </div>
                  <div className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm">Completed</div>
                </div>
              </div>

              <h3 className="font-bold text-green-600 tracking-wider uppercase text-xs mb-3 flex items-center"><ArrowDown className="w-3 h-3 mr-1"/> Queue Adapted</h3>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-green-200 shadow flex justify-between items-center transform transition hover:-translate-y-1">
                  <div>
                    <p className="text-xs text-gray-400 line-through mb-1">Was 10:20 AM</p>
                    <p className="font-bold text-gray-900 flex items-center">ETA: 10:35 AM <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span></p>
                  </div>
                  <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded font-bold">A-102</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-green-200 shadow flex justify-between items-center transform transition hover:-translate-y-1">
                  <div>
                    <p className="text-xs text-gray-400 line-through mb-1">Was 10:40 AM</p>
                    <p className="font-bold text-gray-900">ETA: 10:55 AM</p>
                  </div>
                  <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded font-bold">A-103</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE PROBLEM */}
      <div className="bg-gray-50 py-24 border-y border-gray-100" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Plans are predictable.<br/>Services aren't.
            </h2>
            <p className="text-lg text-gray-600">Most appointment systems manage what was booked. Slotly reacts to what actually happens.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <Clock className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Service Delay</h3>
              <p className="text-gray-600">When a service runs long, downstream ETAs shift automatically. Nobody waits blindly.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <CalendarX className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancellation</h3>
              <p className="text-gray-600">When a customer cancels or no-shows, available time is recovered and the queue pulls forward.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <Users className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Walk-in</h3>
              <p className="text-gray-600">Walk-ins are seamlessly integrated into the live flow without breaking existing appointments.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <TrendingUp className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Early Completion</h3>
              <p className="text-gray-600">If you finish early, waiting customers are notified to move forward. Maximize your schedule.</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW SLOTLY WORKS FLOW */}
      <div className="py-24 mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 mb-16">How Slotly Works</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0 md:space-x-4 overflow-x-auto pb-8">
          {[
            { step: '1', title: 'Book', desc: 'Customer books online or walks in.' },
            { step: '2', title: 'Plan', desc: 'Initial schedule is created.' },
            { step: '3', title: 'Observe', desc: 'Provider tracks actual start/end.' },
            { step: '4', title: 'Adapt', desc: 'System recalculates downstream.' },
            { step: '5', title: 'Notify', desc: 'Customers get ETA updates.' },
            { step: '6', title: 'Learn', desc: 'Future estimates improve automatically.' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center min-w-[120px] relative">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xl mb-4 z-10">{item.step}</div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
              {i < 5 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* PLANNED VS ACTUAL VISUAL */}
      <div className="bg-gray-900 text-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-16">Planned → Actual → Adapted</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto items-center">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Planned</h3>
              <p className="text-4xl font-black text-gray-500 line-through">20 min</p>
            </div>
            <div>
              <ArrowRight className="w-8 h-8 text-gray-600 mx-auto transform rotate-90 md:rotate-0 my-4 md:my-0" />
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Actual</h3>
              <p className="text-4xl font-black text-white">35 min</p>
            </div>
          </div>
          <div className="mt-8 max-w-4xl mx-auto bg-primary-600/20 border border-primary-500 p-8 rounded-2xl">
             <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-4">Adapted</h3>
             <p className="text-xl font-medium text-white mb-2"><span className="text-red-400 font-bold">+15 min delay</span> detected.</p>
             <p className="text-primary-100">Downstream ETAs instantly recalculated. Notifications dispatched.</p>
          </div>
        </div>
      </div>

      {/* CUSTOMERS / BUSINESSES */}
      <div className="py-24 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">For Customers</h2>
            <ul className="space-y-4">
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-primary-600 mr-3"/> Book appointments seamlessly</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-primary-600 mr-3"/> See live queue position</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-primary-600 mr-3"/> View estimated waiting time</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-primary-600 mr-3"/> Receive proactive schedule updates</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">For Businesses</h2>
            <ul className="space-y-4">
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-gray-900 mr-3"/> Manage appointments and flow</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-gray-900 mr-3"/> Handle walk-ins natively</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-gray-900 mr-3"/> Mark cancellations and no-shows</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-gray-900 mr-3"/> Compare planned vs actual duration</li>
              <li className="flex items-center"><ArrowRight className="w-5 h-5 text-gray-900 mr-3"/> Improve future estimates automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="bg-gray-50 py-32 border-t border-gray-200 text-center px-6">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Manage what happens,<br/>not just what was planned.</h2>
        <Link to="/register" className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-8 py-4 text-lg font-bold text-white shadow hover:bg-gray-800 transition">
          Get started for free
        </Link>
      </div>

    </div>
  );
};

export default Landing;
