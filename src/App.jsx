import React, { useState, useEffect } from "react";
import AnomalyChart from "./AnomalyChart";
import AlertSystem from "./AlertSystem";
import UserManagement from "./UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  Database,
  Calendar,
  Printer,
  Download,
  Search,
  Filter,
  AlertTriangle,
  BarChart2,
  Terminal,
  Map,
  Upload
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState({
    http: [],
    logon: [],
    device: [],
    network: [],
    file: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Simulated statistics
  const stats = {
    totalAlerts: 247,
    criticalThreats: 12,
    activeUsers: 1834,
    averageRiskScore: 42
  };

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/api/anomalies-stream");
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      handleNewAnomaly(newData);
    };
    return () => eventSource.close();
  }, []);

  const handleNewAnomaly = (newData) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        message: `New ${newData.activity} anomaly detected`,
        severity: newData.severity || "medium",
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
    
    setData(prev => ({
      ...prev,
      [newData.activity]: [...prev[newData.activity], newData]
    }));
    
    setLoading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('dataset', file);

    try {
        // Simulate upload delay (or replace this with an actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1500));
    
        // Redirect after the upload completes
        window.location.href = "http://localhost:8501/";
      } catch (error) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: `Upload failed: ${error.message}`,
            severity: "high",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      } finally {
        setIsUploading(false);
      }
    };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">ThreatGuard Pro</h1>
        </div>
        
        <nav className="space-y-2">
          {[
            { icon: Activity, label: "Overview", value: "overview" },
            { icon: AlertTriangle, label: "Threats", value: "threats" },
            { icon: Users, label: "Users", value: "users" },
            { icon: BarChart2, label: "Analytics", value: "analytics" },
            { icon: Terminal, label: "Logs", value: "logs" },
            { icon: Map, label: "Topology", value: "topology" },
            { icon: Settings, label: "Settings", value: "settings" }
          ].map(({ icon: Icon, label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${
                activeTab === value ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alerts, users, or activities..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-96"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="p-2 rounded-lg border border-gray-200"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <div className="relative">
              <input
                type="file"
                id="dataset-upload"
                className="hidden"
                accept=".csv,.json"
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => document.getElementById('dataset-upload').click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Dataset'}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Printer className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notif.severity === 'high' ? 'bg-red-100 text-red-800' :
                            notif.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notif.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{notif.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Alerts", value: stats.totalAlerts, icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Critical Threats", value: stats.criticalThreats, icon: Shield, color: "text-red-500" },
            { label: "Active Users", value: stats.activeUsers, icon: Users, color: "text-blue-500" },
            { label: "Risk Score", value: stats.averageRiskScore, icon: Activity, color: "text-green-500" }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="topology">Network Topology</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top row charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnomalyChart 
                    data={data.http} 
                    title="HTTP Anomalies" 
                    className="h-80" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnomalyChart 
                    data={data.logon} 
                    title="Login Patterns" 
                    className="h-80" 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Bottom row charts - Fixed height and proper spacing */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle>Device Status</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <AnomalyChart 
                    data={data.device} 
                    title="Device Anomalies" 
                  />
                </CardContent>
              </Card>

              <Card className="h-96">
                <CardHeader>
                  <CardTitle>Network Traffic</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <AnomalyChart 
                    data={data.network} 
                    title="Network Anomalies" 
                  />
                </CardContent>
              </Card>


            </div>

            {/* Uploaded Dataset Analysis (if available) */}
            {data.uploaded && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Custom Dataset Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnomalyChart 
                    data={data.uploaded} 
                    title="Custom Data Analysis" 
                    className="h-80" 
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="threats">
            <AlertSystem />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {data.uploaded ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Dataset Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <AnomalyChart 
                            data={data.uploaded} 
                            title="Custom Dataset Trends" 
                            className="h-80" 
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Statistical Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                              Total Records: {data.uploaded.length}
                            </p>
                            {/* Add more statistical analysis here */}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="col-span-2 p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        Upload a dataset to view advanced analytics
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById('dataset-upload').click()}
                      >
                        Upload Dataset
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add log viewing functionality here */}
                  <p className="text-gray-500">System logs will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topology">
            <Card>
              <CardHeader>
                <CardTitle>Network Topology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add network topology visualization here */}
                  <p className="text-gray-500">Network topology visualization will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add settings configuration here */}
                  <p className="text-gray-500">Dashboard settings will be configured here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;