'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Invalid email address";
    if (!formData.subject.trim()) return "Subject is required";
    if (!formData.message.trim()) return "Message is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <Card className="bg-navy-900/50 border-slate-800 backdrop-blur-sm max-w-2xl w-full mx-auto">
      <CardContent className="p-6 md:p-8">
        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Message Transmitted</h3>
            <p className="text-slate-400">
              We have received your communication. Our team will decrypt and respond shortly.
            </p>
            <Button 
              variant="outline" 
              className="mt-8 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
              onClick={() => setStatus('idle')}
            >
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-navy-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-navy-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-200">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="What is this regarding?"
                value={formData.subject}
                onChange={handleChange}
                className="bg-navy-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-200">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your project..."
                value={formData.message}
                onChange={handleChange}
                className="min-h-[150px] bg-navy-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors resize-y"
              />
            </div>

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
              >
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </motion.div>
            )}

            <Button 
              type="submit" 
              variant="cyber" 
              className="w-full h-12 text-base rounded-full"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transmitting...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
