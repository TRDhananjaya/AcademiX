import { useState } from 'react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      access_key: "2c05d548-4f17-49d0-ab96-ddccf17769fd",
      name: `${e.target.firstName.value} ${e.target.lastName.value}`,
      email: e.target.email.value,
      message: e.target.message.value,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        e.target.reset();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 select-none relative overflow-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-20 sm:pt-32 sm:pb-24 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-10 -left-20 w-[450px] h-[450px] rounded-full bg-indigo-200/35 blur-[120px] animate-drift pointer-events-none -z-10"></div>
        <div className="absolute bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-purple-200/35 blur-[120px] animate-drift-slow pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-indigo-100/40 blur-[90px] pointer-events-none -z-10"></div>

        {/* Flowing Waves Accent */}
        <svg
          className="absolute -bottom-16 -left-16 w-[560px] h-[560px] text-purple-300/25 pointer-events-none stroke-current -z-10"
          viewBox="0 0 550 550"
          fill="none"
        >
          <path d="M580,20 C460,120 340,240 220,380 C140,480 40,520 -20,540" strokeWidth="2" opacity="0.6" />
          <circle cx="400" cy="400" r="180" strokeWidth="1" opacity="0.2" />
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-14">

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-slate-900 mb-4 tracking-tight">
              Get in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600">
                Touch
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about platform features, school onboarding, or student analytics? We're here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Message Form Card */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-indigo-100/80 shadow-xl shadow-indigo-950/5">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
                Send a Message
              </h3>

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold text-center animate-fade-in-up flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>Message sent successfully! We will get back to you shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all"
                      placeholder="e.g. Alex"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all"
                      placeholder="e.g. Perera"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all"
                    placeholder="name@school.lk"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 resize-none transition-all"
                    placeholder="How can our team help your institution or studies?"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Sending...' : 'Send Message'}</span>
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Details Card */}
            <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-indigo-100/80 shadow-xl shadow-indigo-950/5 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
                Contact Info
              </h3>

              {/* Email */}
              <div className="flex gap-4 items-start p-3.5 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-0.5">Email Us</h4>
                  <p className="text-sm text-indigo-600 font-semibold">support@academix.lk</p>
                  <p className="text-xs text-slate-400 mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-start p-3.5 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-0.5">Call Us</h4>
                  <p className="text-sm text-slate-700 font-medium">+94 11 234 5678</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mon - Fri: 8:00 AM - 5:00 PM</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex gap-4 items-start p-3.5 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-0.5">Office</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    102 Galle Road,<br />
                    Colombo 03, Sri Lanka
                  </p>
                </div>
              </div>

              {/* SLA Response Badge */}
              <div className="pt-2 border-t border-slate-100">
                <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-4 flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Swift Response Guarantee</p>
                    <p className="text-[11px] text-slate-500">Inquiries answered within 1 business day.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}