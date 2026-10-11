import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Clock, TrendingUp, Users, CalendarX, ArrowRight, ArrowDown, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'} />;
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-xs font-bold text-primary-800 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span>Next-Generation Adaptive Service Management</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 mb-6 leading-[1.1]">
                Appointments change.<br />
                <span className="text-primary-600">Your schedule should too.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Traditional booking tools only manage what was planned. Slotly manages what <span className="font-semibold text-gray-900">actually happens</span> in real service environments — absorbing delays, walk-ins, and cancellations automatically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link 
                  to="/register" 
                  className="inline-flex justify-center items-center rounded-xl bg-gray-900 px-7 py-3.5 text-base font-bold text-white shadow-md hover:bg-gray-800 transition active:scale-[0.98]"
                >
                  Get started free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="inline-flex justify-center items-center rounded-xl bg-gray-50 border border-gray-200 px-6 py-3.5 text-base font-semibold text-gray-800 shadow-sm hover:bg-gray-100 transition active:scale-[0.98]"
                >
                  See how it works
                </a>
              </div>

              {/* Trust & Spec Ribbon */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 max-w-lg text-left">
                <div>
                  <div className="text-xl font-black text-gray-900">&lt; 100ms</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Cascade Recalc</div>
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">&gt; 10 min</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Auto-Alert Trigger</div>
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">70 / 30</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Duration Weighting</div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200/80">
                
                {/* Header card label */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs font-bold text-gray-500 ml-2">Live Flow Monitor</span>
                  </div>
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-green-100 text-green-800 rounded">Active</span>
                </div>

                {/* Serving Event: Delayed Service */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Now Serving · Delayed (+15m)
                      </span>
                      <h4 className="font-extrabold text-gray-900 text-base mt-1.5">Consultation (Token S-101)</h4>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                      10:00 AM
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-amber-900 mt-2 pt-2 border-t border-amber-100">
                    <span>Expected: 20 min</span>
                    <span className="font-bold text-red-600">Actual: 35 min elapsed</span>
                  </div>
                </div>

                {/* Transition Divider */}
                <div className="flex items-center justify-center my-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <ArrowDown className="w-3.5 h-3.5 mr-1 text-primary-600 animate-bounce" />
                  <span>Downstream ETAs Recalculated</span>
                </div>

                {/* Downstream Adapted Queue Entries */}
                <div className="space-y-2.5">
                  <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm flex items-center justify-between hover:border-gray-300 transition">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 font-extrabold text-xs flex items-center justify-center">#1</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-gray-900">Token S-102</p>
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">+15m</span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-through">Scheduled: 10:20 AM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary-600">ETA: 10:35 AM</p>
                      <p className="text-[10px] text-gray-400">Notified</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm flex items-center justify-between hover:border-gray-300 transition">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 font-extrabold text-xs flex items-center justify-center">#2</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-gray-900">Token S-103</p>
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">+15m</span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-through">Scheduled: 10:40 AM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary-600">ETA: 10:55 AM</p>
                      <p className="text-[10px] text-gray-400">Notified</p>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span className="flex items-center"><Zap className="w-3 h-3 text-amber-500 mr-1" /> Dynamic queue engine</span>
                  <span className="font-semibold text-gray-700">Zero manual math</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* THE PROBLEM & ADAPTIVE SOLUTION */}
      <div className="bg-gray-50 py-20 border-y border-gray-200" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-extrabold tracking-widest text-primary-600 uppercase mb-2">The Real-World Gap</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
              Plans are static. Service operations are not.
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              When a salon haircut takes 45 minutes instead of 20, or a doctor consultation finishes 10 minutes early, calendar appointments break immediately. Slotly responds to four real operational events:
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Service Delays</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When active services run longer than planned, all downstream waiting customers have their ETAs extended automatically.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Early Completion</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When staff complete tasks early, saved time is credited immediately to pull waiting customers forward, reducing dead time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <CalendarX className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Cancellations & No-Shows</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Unfilled slots are instantly reconciled. Cancelled or no-show entries are pruned and queue positions advance in real time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Walk-In Fluidity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Physical walk-ins are seamlessly queued with tokens without overwriting or disrupting existing booked appointments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6-STEP ADAPTIVE ENGINE FLOW */}
      <div className="py-20 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-extrabold tracking-widest text-primary-600 uppercase mb-2">The Closed-Loop Cycle</p>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">How the Slotly Engine Operates</h2>
          <p className="text-gray-500 mt-3 text-sm">A complete cycle from booking to continuous mathematical learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Book', tag: 'Reservation', desc: 'Customer books online or provider registers walk-in.' },
            { step: '02', title: 'Plan', tag: 'Baseline', desc: 'Baseline schedule initialized from catalog duration.' },
            { step: '03', title: 'Observe', tag: 'Reality', desc: 'Provider starts & tracks real-world service duration.' },
            { step: '04', title: 'Adapt', tag: 'Engine', desc: 'Queue engine recalculates all downstream ETAs.' },
            { step: '05', title: 'Notify', tag: 'Dispatch', desc: 'Automated notification logged when shift exceeds 10m.' },
            { step: '06', title: 'Learn', tag: 'Improvement', desc: 'Historical rolling average refines future duration estimates.' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-black text-gray-300">{item.step}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PLANNED → ACTUAL → ADAPTED DEEP-DIVE */}
      <div className="bg-gray-950 text-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-400">Core Thesis</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">Planned → Actual → Adapted</h2>
            <p className="text-gray-400 mt-3 text-sm">See the mathematical adaptation in action.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">1. Planned</span>
              <p className="text-3xl font-black text-gray-400 line-through mt-2 mb-1">20 Minutes</p>
              <p className="text-xs text-gray-500">Initial catalog estimate for standard haircut</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">2. Actual</span>
              <p className="text-3xl font-black text-white mt-2 mb-1">45 Minutes</p>
              <p className="text-xs text-amber-300 font-semibold">+25 min real operational overrun</p>
            </div>

            <div className="bg-primary-950/80 p-6 rounded-2xl border border-primary-600/50">
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">3. Adapted</span>
              <p className="text-3xl font-black text-primary-300 mt-2 mb-1">+25m Shift</p>
              <p className="text-xs text-primary-200">Customer 2 & 3 ETAs shifted forward instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* USER ROLES COMPARISON */}
      <div className="py-20 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="inline-flex p-3 rounded-2xl bg-primary-50 text-primary-700 mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Customers</h3>
            <p className="text-sm text-gray-500 mb-6">Enjoy transparency without wasting time in physical waiting rooms.</p>
            <ul className="space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Instant booking with automated queue token generation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Live queue position tracking and dynamic wait time</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Real-time ETA notifications whenever schedules shift &gt; 10m</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Self-service appointment cancellations with automatic slot release</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="inline-flex p-3 rounded-2xl bg-gray-100 text-gray-900 mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Service Providers</h3>
            <p className="text-sm text-gray-500 mb-6">Streamline daily operations with intelligent queue controls.</p>
            <ul className="space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>One-click Start, Complete, No-Show, and Cancel operations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Direct walk-in customer addition without booking friction</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Hypothetical What-If Simulator for stress-testing delays</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 shrink-0" />
                <span>Continuous data-driven historical duration adaptation</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="bg-gray-50 py-24 border-t border-gray-200 text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-950 mb-4 tracking-tight">
            Manage what happens,<br />not just what was planned.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Experience the adaptive queue and service-flow management platform today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="inline-flex justify-center items-center rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-md hover:bg-gray-800 transition active:scale-[0.98]"
            >
              Create free account
            </Link>
            <Link 
              to="/login" 
              className="inline-flex justify-center items-center rounded-xl bg-white border border-gray-300 px-8 py-4 text-base font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Landing;
