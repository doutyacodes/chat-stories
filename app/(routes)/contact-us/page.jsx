'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-10">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 pt-16 md:pt-28">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Let&apos;s talk
          </h1>
          <p className="text-white/40 text-base md:text-lg max-w-md">
            Got a question, a story idea, or feedback? Drop us a message — we read everything.
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
          
          {/* Form — takes 3 columns */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs uppercase tracking-widest text-white/30 font-medium mb-3">
                    Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-5 py-4 border border-white/[0.07] rounded-xl bg-white/[0.03] text-white 
                      placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                      transition-all duration-300 text-[15px]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs uppercase tracking-widest text-white/30 font-medium mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-5 py-4 border border-white/[0.07] rounded-xl bg-white/[0.03] text-white 
                      placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                      transition-all duration-300 text-[15px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest text-white/30 font-medium mb-3">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  rows={7}
                  className="w-full px-5 py-4 border border-white/[0.07] rounded-xl bg-white/[0.03] text-white 
                    placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                    transition-all duration-300 resize-none text-[15px] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="group flex items-center gap-3 bg-white text-black font-semibold px-8 py-4 rounded-full 
                  text-[15px] hover:bg-white/90 active:scale-[0.97] transition-all duration-200 
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Message'}
                {!sending && (
                  <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>

          {/* Right side info — takes 2 columns */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="space-y-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/25 font-medium mb-3">Email</p>
                <a
                  href="mailto:hello@pingtales.com"
                  className="text-white/70 hover:text-white transition-colors duration-200 text-base"
                >
                  hello@pingtales.com
                </a>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-white/25 font-medium mb-3">Response time</p>
                <p className="text-white/50 text-base">
                  We usually get back within 24 hours.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-white/25 font-medium mb-3">For creators</p>
                <p className="text-white/50 text-base text-justify">
                  Want to publish stories or games on Ping Tales? 
                  You can start right away — hit the Create button in the menu 
                  and you&apos;re good to go.
                </p>
              </div>
            </div>

            {/* Subtle decorative element */}
            <div className="hidden md:block mt-16">
              <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />
              <p className="text-white/20 text-sm">
                Ping Tales — stories that feel like conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
