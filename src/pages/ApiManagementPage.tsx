import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CopyIcon, EyeIcon, EyeOffIcon, SettingsIcon, KeyIcon, PlusIcon, RefreshCw, ShieldIcon, Globe, ClockIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";

const ApiManagementPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(true);
  const [keyType, setKeyType] = useState("general");
  const [selectedApiTab, setSelectedApiTab] = useState("api-keys");

  const mockApiKey = "vx1A2B3C4D5E6F7G8H9I0J";
  const mockSecretKey = "sT1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N";

  const handleCopyKey = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const handleRegenerateKey = () => {
    if (isDemoMode) {
      toast.success("API keys regenerated", {
        description: "Your new API keys have been generated successfully",
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  const handleCreateApiKey = () => {
    if (isDemoMode) {
      toast.success("New API key created", {
        description: "Your API key has been created successfully",
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">API Management</h1>
            <p className="text-sm text-white/70 mt-1">Manage API keys for programmatic trading</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Tabs defaultValue={selectedApiTab} onValueChange={setSelectedApiTab} className="space-y-4">
          <TabsList className="bg-white/5 text-white">
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-white/10">API Keys</TabsTrigger>
            <TabsTrigger value="documentation" className="data-[state=active]:bg-white/10">Documentation</TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-white/10">Usage & Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardHeader>
                    <CardTitle>Your API Keys</CardTitle>
                    <CardDescription className="text-white/70">
                      Manage your API keys for accessing the Vertex Trading API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isDemoMode ? (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">General API Key</h3>
                              <p className="text-sm text-white/70">Created on May 10, 2024</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-white/70">API Key</Label>
                              <div className="flex items-center space-x-2">
                                <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 flex-1 font-mono text-sm truncate">
                                  {showApiKey ? mockApiKey : "•".repeat(mockApiKey.length)}
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => handleCopyKey(mockApiKey, "API Key")}
                                >
                                  <CopyIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white/70">Secret Key</Label>
                              <div className="flex items-center space-x-2">
                                <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 flex-1 font-mono text-sm truncate">
                                  {showSecretKey ? mockSecretKey : "•".repeat(mockSecretKey.length)}
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => setShowSecretKey(!showSecretKey)}
                                >
                                  {showSecretKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => handleCopyKey(mockSecretKey, "Secret Key")}
                                >
                                  <CopyIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Table>
                              <TableBody>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">Permissions</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Badge className="bg-white/10 text-white/70">Read</Badge>
                                      <Badge className="bg-white/10 text-white/70">Trade</Badge>
                                      <Badge className="bg-white/10 text-white/70">Withdraw</Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">IP Restriction</TableCell>
                                  <TableCell>
                                    <Badge className="bg-amber-500/20 text-amber-500">Restricted (3 IPs)</Badge>
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">Last Used</TableCell>
                                  <TableCell>10 minutes ago from 192.168.1.1</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div className="flex justify-between mt-4">
                            <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white" onClick={handleRegenerateKey}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate
                            </Button>
                            <Button variant="destructive">
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">Trading Bot API Key</h3>
                              <p className="text-sm text-white/70">Created on May 5, 2024</p>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-500">Read-Only</Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-white/70">API Key</Label>
                              <div className="flex items-center space-x-2">
                                <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 flex-1 font-mono text-sm truncate">
                                  vx7Z8Y9X0W1V2U3T4S5R6Q7P8O
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => handleCopyKey("vx7Z8Y9X0W1V2U3T4S5R6Q7P8O", "API Key")}
                                >
                                  <CopyIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Table>
                              <TableBody>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">Permissions</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Badge className="bg-white/10 text-white/70">Read</Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">IP Restriction</TableCell>
                                  <TableCell>
                                    <Badge className="bg-green-500/20 text-green-500">No Restriction</Badge>
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-white/10">
                                  <TableCell className="text-white/70">Last Used</TableCell>
                                  <TableCell>2 hours ago from 203.0.113.1</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div className="flex justify-between mt-4">
                            <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white" onClick={handleRegenerateKey}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate
                            </Button>
                            <Button variant="destructive">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <KeyIcon className="h-12 w-12 text-white/30 mb-3" />
                        <p className="text-white/70 mb-4">You don't have any API keys yet</p>
                        <p className="text-white/50 mb-6 max-w-md">Create an API key to start using the Vertex Trading API for programmatic trading</p>
                        <Button className="bg-[#F2FF44] text-black hover:bg-[#E1EE33]" onClick={handleCreateApiKey}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Create API Key
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isDemoMode && (
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
                    <CardHeader>
                      <CardTitle>API Key Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Today's API Calls</span>
                            <span>1,245 / 10,000</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F2FF44] rounded-full" style={{ width: "12.45%" }}></div>
                          </div>
                        </div>

                        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                          <h4 className="font-medium mb-3">Recent API Activity</h4>
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10">
                                <TableHead className="text-white/70">Timestamp</TableHead>
                                <TableHead className="text-white/70">Endpoint</TableHead>
                                <TableHead className="text-white/70">IP Address</TableHead>
                                <TableHead className="text-white/70">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-mono text-xs">2024-05-10 14:23:45</TableCell>
                                <TableCell className="font-mono text-xs">/api/v1/account</TableCell>
                                <TableCell className="font-mono text-xs">192.168.1.1</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-500/20 text-green-500">200 OK</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-mono text-xs">2024-05-10 14:22:30</TableCell>
                                <TableCell className="font-mono text-xs">/api/v1/market/ticker</TableCell>
                                <TableCell className="font-mono text-xs">192.168.1.1</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-500/20 text-green-500">200 OK</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-mono text-xs">2024-05-10 14:20:11</TableCell>
                                <TableCell className="font-mono text-xs">/api/v1/orders</TableCell>
                                <TableCell className="font-mono text-xs">192.168.1.1</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-500/20 text-green-500">200 OK</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-white/10 hover:bg-white/5">
                                <TableCell className="font-mono text-xs">2024-05-10 14:15:09</TableCell>
                                <TableCell className="font-mono text-xs">/api/v1/orders/12345</TableCell>
                                <TableCell className="font-mono text-xs">203.0.113.1</TableCell>
                                <TableCell>
                                  <Badge className="bg-red-500/20 text-red-500">401 Unauthorized</Badge>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardHeader>
                    <CardTitle>Create New API Key</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label>Key Name</Label>
                        <Input className="bg-white/5 border-white/10 text-white" placeholder="My Trading Bot" />
                      </div>

                      <div className="space-y-2">
                        <Label>Key Type</Label>
                        <Select value={keyType} onValueChange={setKeyType}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select permissions" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white">
                            <SelectItem value="readonly">Read Only</SelectItem>
                            <SelectItem value="trading">Trading (No Withdrawals)</SelectItem>
                            <SelectItem value="general">General API Key</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>IP Restriction</Label>
                          <Switch 
                            checked={ipRestriction}
                            onCheckedChange={setIpRestriction}
                            className="data-[state=checked]:bg-[#F2FF44]"
                          />
                        </div>
                        {ipRestriction && (
                          <div className="pt-2">
                            <Input className="bg-white/5 border-white/10 text-white" placeholder="Enter IP addresses (comma separated)" />
                            <p className="text-xs text-white/50 mt-1">
                              Enter IP addresses that are allowed to use this API key (e.g., 192.168.1.1, 10.0.0.1)
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateApiKey();
                        }}
                      >
                        Create API Key
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
                  <CardHeader>
                    <CardTitle>Security Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <ShieldIcon className="h-5 w-5 text-[#F2FF44]" />
                        </div>
                        <div>
                          <div className="font-medium">Restrict IPs</div>
                          <div className="text-white/70">Only allow specific IPs to access your API</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <KeyIcon className="h-5 w-5 text-[#F2FF44]" />
                        </div>
                        <div>
                          <div className="font-medium">Limit Permissions</div>
                          <div className="text-white/70">Only grant the permissions you need</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <RefreshCw className="h-5 w-5 text-[#F2FF44]" />
                        </div>
                        <div>
                          <div className="font-medium">Rotate Keys</div>
                          <div className="text-white/70">Regenerate your API keys periodically</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <InfoIcon className="h-5 w-5 text-[#F2FF44]" />
                        </div>
                        <div>
                          <div className="font-medium">Monitor Usage</div>
                          <div className="text-white/70">Regularly check your API key activity</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription className="text-white/70">
                  Learn how to use the Vertex Trading API for programmatic trading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Getting Started</h3>
                    <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                      <p className="text-white/70 mb-4">
                        The Vertex Trading API allows you to automate your trading strategies. Here's a quick example of how to make a request:
                      </p>
                      <div className="bg-black/50 rounded-md p-4 font-mono text-sm">
                        <div className="text-blue-400">curl -X GET "https://api.vertex-trading.com/api/v1/market/ticker?symbol=BTC-USDT" \</div>
                        <div className="text-green-400">  -H "X-API-KEY: YOUR_API_KEY"</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Endpoints</h3>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge className="bg-blue-500/20 text-blue-500 mr-2">GET</Badge>
                            <span className="font-mono">/api/v1/market/ticker</span>
                          </div>
                          <Badge className="bg-white/10 text-white/70">Public</Badge>
                        </div>
                        <p className="text-white/70">Get the latest price ticker for a trading pair</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge className="bg-blue-500/20 text-blue-500 mr-2">GET</Badge>
                            <span className="font-mono">/api/v1/market/orderbook</span>
                          </div>
                          <Badge className="bg-white/10 text-white/70">Public</Badge>
                        </div>
                        <p className="text-white/70">Get the current order book for a trading pair</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge className="bg-blue-500/20 text-blue-500 mr-2">GET</Badge>
                            <span className="font-mono">/api/v1/account</span>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-500">Private</Badge>
                        </div>
                        <p className="text-white/70">Get your account information</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge className="bg-green-500/20 text-green-500 mr-2">POST</Badge>
                            <span className="font-mono">/api/v1/orders</span>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-500">Private</Badge>
                        </div>
                        <p className="text-white/70">Place a new order</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge className="bg-red-500/20 text-red-500 mr-2">DELETE</Badge>
                            <span className="font-mono">/api/v1/orders/:id</span>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-500">Private</Badge>
                        </div>
                        <p className="text-white/70">Cancel an existing order</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white">
                      <Globe className="mr-2 h-4 w-4" />
                      View Full Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript">
                  <TabsList className="w-full bg-white/5 text-white">
                    <TabsTrigger value="javascript" className="data-[state=active]:bg-white/10">JavaScript</TabsTrigger>
                    <TabsTrigger value="python" className="data-[state=active]:bg-white/10">Python</TabsTrigger>
                    <TabsTrigger value="go" className="data-[state=active]:bg-white/10">Go</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript" className="pt-4">
                    <div className="rounded-lg bg-black/50 p-4 font-mono text-sm">
                      <div className="text-green-400">// Fetch account balance</div>
                      <div className="text-white">const axios = require('axios');</div>
                      <div className="text-white">const apiKey = 'YOUR_API_KEY';</div>
                      <div className="text-white">const apiSecret = 'YOUR_API_SECRET';</div>
                      <div className="text-white">const timestamp = Date.now();</div>
                      <div className="text-white">const signature = createSignature(timestamp, apiSecret);</div>
                      <div className="text-white"></div>
                      <div className="text-white">axios.get('https://api.vertex-trading.com/api/v1/account', {'{'}</div>
                      <div className="text-white">  headers: {'{'}</div>
                      <div className="text-white">    'X-API-KEY': apiKey,</div>
                      <div className="text-white">    'X-TIMESTAMP': timestamp,</div>
                      <div className="text-white">    'X-SIGNATURE': signature</div>
                      <div className="text-white">  {'}'}</div>
                      <div className="text-white">{'}'}).then((response) {'=>'} {'{'}</div>
                      <div className="text-white">  console.log(response.data);</div>
                      <div className="text-white">{'}'}).catch((error) {'=>'} {'{'}</div>
                      <div className="text-white">  console.error(error);</div>
                      <div className="text-white">{'}'});</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="pt-4">
                    <div className="rounded-lg bg-black/50 p-4 font-mono text-sm">
                      <div className="text-green-400"># Fetch account balance</div>
                      <div className="text-white">import requests</div>
                      <div className="text-white">import time</div>
                      <div className="text-white">import hmac</div>
                      <div className="text-white">import hashlib</div>
                      <div className="text-white"></div>
                      <div className="text-white">api_key = 'YOUR_API_KEY'</div>
                      <div className="text-white">api_secret = 'YOUR_API_SECRET'</div>
                      <div className="text-white">timestamp = str(int(time.time() * 1000))</div>
                      <div className="text-white"></div>
                      <div className="text-white">def create_signature(timestamp, secret):</div>
                      <div className="text-white">    message = timestamp</div>
                      <div className="text-white">    signature = hmac.new(</div>
                      <div className="text-white">        bytes(secret, 'utf-8'),</div>
                      <div className="text-white">        bytes(message, 'utf-8'),</div>
                      <div className="text-white">        hashlib.sha256</div>
                      <div className="text-white">    ).hexdigest()</div>
                      <div className="text-white">    return signature</div>
                      <div className="text-white"></div>
                      <div className="text-white">signature = create_signature(timestamp, api_secret)</div>
                      <div className="text-white"></div>
                      <div className="text-white">headers = {'{'}</div>
                      <div className="text-white">    'X-API-KEY': api_key,</div>
                      <div className="text-white">    'X-TIMESTAMP': timestamp,</div>
                      <div className="text-white">    'X-SIGNATURE': signature</div>
                      <div className="text-white">{'}'}</div>
                      <div className="text-white"></div>
                      <div className="text-white">response = requests.get('https://api.vertex-trading.com/api/v1/account', headers=headers)</div>
                      <div className="text-white">print(response.json())</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="go" className="pt-4">
                    <div className="rounded-lg bg-black/50 p-4 font-mono text-sm">
                      <div className="text-green-400">// Fetch account balance</div>
                      <div className="text-white">package main</div>
                      <div className="text-white"></div>
                      <div className="text-white">import (</div>
                      <div className="text-white">	"crypto/hmac"</div>
                      <div className="text-white">	"crypto/sha256"</div>
                      <div className="text-white">	"encoding/hex"</div>
                      <div className="text-white">	"fmt"</div>
                      <div className="text-white">	"io/ioutil"</div>
                      <div className="text-white">	"net/http"</div>
                      <div className="text-white">	"strconv"</div>
                      <div className="text-white">	"time"</div>
                      <div className="text-white">)</div>
                      <div className="text-white"></div>
                      <div className="text-white">func main() {'{'}</div>
                      <div className="text-white">	apiKey := "YOUR_API_KEY"</div>
                      <div className="text-white">	apiSecret := "YOUR_API_SECRET"</div>
                      <div className="text-white">	timestamp := strconv.FormatInt(time.Now().UnixNano()/1000000, 10)</div>
                      <div className="text-white"></div>
                      <div className="text-white">	signature := createSignature(timestamp, apiSecret)</div>
                      <div className="text-white"></div>
                      <div className="text-white">	req, _ := http.NewRequest("GET", "https://api.vertex-trading.com/api/v1/account", nil)</div>
                      <div className="text-white">	req.Header.Set("X-API-KEY", apiKey)</div>
                      <div className="text-white">	req.Header.Set("X-TIMESTAMP", timestamp)</div>
                      <div className="text-white">	req.Header.Set("X-SIGNATURE", signature)</div>
                      <div className="text-white"></div>
                      <div className="text-white">	client := &http.Client{'{}'}</div>
                      <div className="text-white">	resp, err := client.Do(req)</div>
                      <div className="text-white">	if err != nil {'{'}</div>
                      <div className="text-white">		fmt.Println(err)</div>
                      <div className="text-white">		return</div>
                      <div className="text-white">	{'}'}</div>
                      <div className="text-white">	defer resp.Body.Close()</div>
                      <div className="text-white"></div>
                      <div className="text-white">	body, _ := ioutil.ReadAll(resp.Body)</div>
                      <div className="text-white">	fmt.Println(string(body))</div>
                      <div className="text-white">{'}'}</div>
                      <div className="text-white"></div>
                      <div className="text-white">func createSignature(timestamp, secret string) string {'{'}</div>
                      <div className="text-white">	h := hmac.New(sha256.New, []byte(secret))</div>
                      <div className="text-white">	h.Write([]byte(timestamp))</div>
                      <div className="text-white">	return hex.EncodeToString(h.Sum(nil))</div>
                      <div className="text-white">{'}'}</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Rate Limits & Usage</CardTitle>
                <CardDescription className="text-white/70">
                  Understand the API rate limits and how to optimize your requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F2FF44]/20 mb-3">
                            <RefreshCw className="h-6 w-6 text-[#F2FF44]" />
                          </div>
                          <h3 className="font-medium mb-1">Request Limits</h3>
                          <p className="text-white/70 text-sm mb-2">Rate limits per minute</p>
                          <div className="text-2xl font-bold">1,200</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F2FF44]/20 mb-3">
                            <ClockIcon className="h-6 w-6 text-[#F2FF44]" />
                          </div>
                          <h3 className="font-medium mb-1">Order Rate</h3>
                          <p className="text-white/70 text-sm mb-2">Orders per 10 seconds</p>
                          <div className="text-2xl font-bold">50</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F2FF44]/20 mb-3">
                            <Globe className="h-6 w-6 text-[#F2FF44]" />
                          </div>
                          <h3 className="font-medium mb-1">IP Limits</h3>
                          <p className="text-white/70 text-sm mb-2">Allowed IPs per key</p>
                          <div className="text-2xl font-bold">10</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <h3 className="font-medium mb-4">Rate Limit Tiers</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/70">Tier</TableHead>
                          <TableHead className="text-white/70">Requirements</TableHead>
                          <TableHead className="text-white/70">API Calls (per min)</TableHead>
                          <TableHead className="text-white/70">Order Rate (per 10s)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>Basic</TableCell>
                          <TableCell>Default</TableCell>
                          <TableCell>1,200</TableCell>
                          <TableCell>50</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>Premium</TableCell>
                          <TableCell>10,000 VTEX staked</TableCell>
                          <TableCell>6,000</TableCell>
                          <TableCell>300</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>Professional</TableCell>
                          <TableCell>50,000 VTEX staked</TableCell>
                          <TableCell>12,000</TableCell>
                          <TableCell>600</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>Institutional</TableCell>
                          <TableCell>Contact us</TableCell>
                          <TableCell>Custom</TableCell>
                          <TableCell>Custom</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <h3 className="font-medium mb-3">Rate Limit Headers</h3>
                    <p className="text-white/70 mb-4">
                      Each API response includes headers to help you track your rate limit usage:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/70">Header</TableHead>
                          <TableHead className="text-white/70">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-xs">X-RateLimit-Limit</TableCell>
                          <TableCell>The maximum number of requests you're permitted to make per minute</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-xs">X-RateLimit-Remaining</TableCell>
                          <TableCell>The number of requests remaining in the current rate limit window</TableCell>
                        </TableRow>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-xs">X-RateLimit-Reset</TableCell>
                          <TableCell>The time at which the current rate limit window resets in UTC epoch seconds</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <h3 className="font-medium mb-3">Best Practices</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                          <span className="text-sm font-medium">1</span>
                        </div>
                        <div>
                          <div className="font-medium">Implement Exponential Backoff</div>
                          <div className="text-white/70 text-sm">When rate limited, wait and retry with increasing delays</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                          <span className="text-sm font-medium">2</span>
                        </div>
                        <div>
                          <div className="font-medium">Use WebSocket for Real-time Data</div>
                          <div className="text-white/70 text-sm">WebSocket connections are more efficient for price updates</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                          <span className="text-sm font-medium">3</span>
                        </div>
                        <div>
                          <div className="font-medium">Cache Responses</div>
                          <div className="text-white/70 text-sm">Cache responses to reduce the number of API calls</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                          <span className="text-sm font-medium">4</span>
                        </div>
                        <div>
                          <div className="font-medium">Batch Requests</div>
                          <div className="text-white/70 text-sm">Combine multiple actions in a single API call when possible</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ApiManagementPage;