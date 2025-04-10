
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

const FAQData = [
  {
    question: "How do I get started with trading?",
    answer: "To start trading, first complete your account verification, deposit funds, and explore our demo trading feature to practice without risk. Once comfortable, you can start live trading with real funds."
  },
  {
    question: "What are the deposit and withdrawal methods?",
    answer: "We support multiple payment methods including bank transfers, crypto deposits, and various digital payment solutions. The minimum deposit is $10 and withdrawals are processed within 24 hours."
  },
  {
    question: "How does the automated trading work?",
    answer: "Our automated trading system uses advanced algorithms to execute trades based on predefined strategies. You can choose from various pre-built strategies or create your own through our Bots & Strategies section."
  },
  {
    question: "Is my account secure?",
    answer: "Yes, we implement industry-standard security measures including 2FA, encrypted communications, and regular security audits to protect your account and funds."
  },
  {
    question: "What trading pairs are available?",
    answer: "We offer a wide range of trading pairs including major cryptocurrencies, forex pairs, and popular stock CFDs. Check our Markets section for the complete list."
  }
];

const SupportPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("faq");
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      await addDoc(collection(db, 'support_tickets'), {
        ...contactForm,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you within 24 hours.",
      });
      
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Support Center</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
                <TabsTrigger value="faq" className="text-white data-[state=active]:bg-accent">
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-white data-[state=active]:bg-accent">
                  Contact Us
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq">
                <Accordion type="single" collapsible className="w-full">
                  {FAQData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-white">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/70">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="contact">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                      className="bg-background/40"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                      className="bg-background/40"
                    />
                  </div>
                  <Input
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                    className="bg-background/40"
                  />
                  <Textarea
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    className="min-h-[150px] bg-background/40"
                  />
                  <Button type="submit" className="w-full">
                    Submit Support Ticket
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
