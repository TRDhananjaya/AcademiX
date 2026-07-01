import { useState } from 'react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import logoBlack from '../assets/logo_black.png';

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
    <div className="min-h-screen flex flex-col bg-[#fcfdff] select-none">
      <Header />

      <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl animate-drift"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl animate-float"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-normal py-1">
              Get in <span className="inline-block text-gradient px-1 py-1">Touch</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Have questions about features,plans or AcademiX? We are here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">


            {/* Message Form Card */}
            <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-slate-100 shadow-md-custom">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Send a Message
              </h3>

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-semibold text-center animate-fade-in-up">
                  ✓ Message sent successfully! We will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-[13.5px] font-medium text-slate-700 mb-2 tracking-wide uppercase">First Name</label>
                    <input type="text" id="firstName" name="firstName" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-[13.5px] font-medium text-slate-700 mb-2 tracking-wide uppercase">Last Name</label>
                    <input type="text" id="lastName" name="lastName" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400" placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[13.5px] font-medium text-slate-700 mb-2 tracking-wide uppercase">Email Address</label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400" placeholder="sample@email.com" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[13.5px] font-medium text-slate-700 mb-2 tracking-wide uppercase">Message</label>
                  <textarea id="message" name="message" rows="5" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400 resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="py-3.5 px-10 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </div>
              </form>
            </div>
            {/* Contact Details Card */}
            <div className="lg:col-span-5 bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-100 shadow-md-custom space-y-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Contact Info
              </h3>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-[15px] mb-1">Email Us</h4>
                  <p className="text-[14px] text-slate-500">support@academix.lk</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-[15px] mb-1">Call Us</h4>
                  <p className="text-[14px] text-slate-500">+94 11 234 5678</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">Mon - Fri: 8:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-[15px] mb-1">Office</h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed">
                    102 Galle Road,<br />
                    Colombo 03, Sri Lanka
                  </p>
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