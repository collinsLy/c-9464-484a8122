import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SearchIcon, PlusCircle, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Filter, SlidersHorizontal 
} from "lucide-react";

const SupportPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("faq");
  
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
                <div className="flex flex-col space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Frequently asked questions coming soon.
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact">
                <div className="text-center py-8 text-muted-foreground">
                  Contact support form coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;