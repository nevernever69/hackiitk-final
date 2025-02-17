import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Shield,
  Users,
  Activity,
  Settings,
  Database,
  Calendar,
  Printer,
  FileDown,
  
  Download,
  Search,
  Filter,
  AlertTriangle,
  BarChart2,
  Terminal,
  Map,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import AnomalyChart from './AnomalyChart'
import AlertSystem from './AlertSystem'
import UserManagement from "./UserManagement";
import ThreatsList from './ThreadList';  // Add this import

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const [data, setData] = useState({
    http: [],
    logon: [],
    device: [],
    network: [],
    file: [],
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const generateData = async () => {
    setIsGenerating(true);
    
    // Show generating toast
    toast({
      title: "Generating Data",
      description: "Please wait while we prepare your file...",
    });

    // Simulate data generation delay
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Generate sample data
    const headers = ["timestamp", "type", "severity", "source", "description"];
    const rows = [];
    
    // Generate 100 sample rows
    for (let i = 0; i < 100; i++) {
      const types = ["Network Intrusion", "Malware Detection", "Failed Login", "Data Exfiltration"];
      const severities = ["high", "medium", "low"];
      
      rows.push([
        new Date(Date.now() - Math.random() * 86400000).toISOString(),
        types[Math.floor(Math.random() * types.length)],
        severities[Math.floor(Math.random() * severities.length)],
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        `Sample security event ${i + 1}`
      ]);
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DataGenerate.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setIsGenerating(false);
    
    // Show completion toast
    toast({
      title: "Data Generated",
      description: "Your file has been downloaded successfully.",
      variant: "success",
    });
  };
  // Convert stats to state to make it dynamic
  const [stats, setStats] = useState({
    totalAlerts: { value: 0, trend: "stable", percentage: 0 },
    criticalThreats: { value: 0, trend: "stable", percentage: 0 },
    activeUsers: { value: 0, trend: "stable", percentage: 0 },
    averageRiskScore: { value: 0, trend: "stable", percentage: 0 },
  });
  const [previousStats, setPreviousStats] = useState(null);

  // Calculate trend and percentage change
  const calculateTrend = (current, previous) => {
    if (!previous) return { trend: "stable", percentage: 0 };
    const difference = current - previous;
    const percentage = previous !== 0 ? Math.round((difference / previous) * 100) : 0;
    return {
      trend: difference > 0 ? "up" : difference < 0 ? "down" : "stable",
      percentage: Math.abs(percentage),
    };
  };

  // Update stats based on new anomaly data
  const updateStats = (newAnomaly) => {
    setPreviousStats({ ...stats });
    
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Update total alerts
      newStats.totalAlerts.value += 1;
      
      // Update critical threats if severity is high
      if (newAnomaly.severity === "high") {
        newStats.criticalThreats.value += 1;
      }
      
      // Update active users if it's a user-related anomaly
      if (newAnomaly.activity === "logon") {
        newStats.activeUsers.value = Math.max(1, newStats.activeUsers.value + 
          (Math.random() > 0.5 ? 1 : -1)); // Simulate user activity
      }
      
      // Calculate new risk score based on severity
      const severityScore = 
        newAnomaly.severity === "high" ? 100 :
        newAnomaly.severity === "medium" ? 50 : 25;
      newStats.averageRiskScore.value = Math.round(
        (newStats.averageRiskScore.value + severityScore) / 2
      );
      
      // Calculate trends for all metrics
      if (previousStats) {
        const totalAlertsTrend = calculateTrend(newStats.totalAlerts.value, previousStats.totalAlerts.value);
        const criticalThreatsTrend = calculateTrend(newStats.criticalThreats.value, previousStats.criticalThreats.value);
        const activeUsersTrend = calculateTrend(newStats.activeUsers.value, previousStats.activeUsers.value);
        const riskScoreTrend = calculateTrend(newStats.averageRiskScore.value, previousStats.averageRiskScore.value);
        
        newStats.totalAlerts = { ...newStats.totalAlerts, ...totalAlertsTrend };
        newStats.criticalThreats = { ...newStats.criticalThreats, ...criticalThreatsTrend };
        newStats.activeUsers = { ...newStats.activeUsers, ...activeUsersTrend };
        newStats.averageRiskScore = { ...newStats.averageRiskScore, ...riskScoreTrend };
      }
      
      return newStats;
    });
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
    // Existing notification logic
    toast({
      title: "New Anomaly Detected",
      description: `${newData.activity} anomaly with ${newData.severity} severity`,
      variant: newData.severity === "high" ? "destructive" : "default",
    });

    setNotifications((prev) => [
      {
        id: Date.now(),
        message: `New ${newData.activity} anomaly detected`,
        severity: newData.severity || "medium",
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);

    // Update data state
    setData((prev) => ({
      ...prev,
      [newData.activity]: [...prev[newData.activity], newData],
    }));

    // Update stats with the new anomaly
    updateStats(newData);

    setLoading(false);
  };

  // Initialize stats with some data when component mounts
  useEffect(() => {
    setStats({
      totalAlerts: { value: 247, trend: "stable", percentage: 0 },
      criticalThreats: { value: 12, trend: "stable", percentage: 0 },
      activeUsers: { value: 1834, trend: "stable", percentage: 0 },
      averageRiskScore: { value: 42, trend: "stable", percentage: 0 },
    });
  }, []);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("dataset", file);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Upload Successful",
        description: "Your dataset has been processed successfully.",
      });
      window.location.href = "http://localhost:8501/";
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const StatCard = ({ label, stat, icon: Icon }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {stat.percentage}%
                </span>
                <ChevronDown
                  className={`w-4 h-4 transform ${
                    stat.trend === "up"
                      ? "rotate-180 text-green-500"
                      : stat.trend === "down"
                      ? "text-red-500"
                      : "rotate-90 text-gray-500"
                  }`}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50" />
              <Icon className="w-8 h-8 text-blue-500 relative z-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  const navigationItems = [
    { icon: Activity, label: "Overview", value: "overview" },
    { icon: AlertTriangle, label: "Threats", value: "threats" },
    { icon: Users, label: "Users", value: "users" },
    { icon: BarChart2, label: "Analytics", value: "analytics" },
    { icon: Terminal, label: "Logs", value: "logs" },
    { icon: Map, label: "Topology", value: "topology" },
    { icon: FileDown, label: "Generate Data", value: "generate" },  // Add this item
    { icon: Settings, label: "Settings", value: "settings" },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "256px" }}
        className="fixed left-0 top-0 h-full bg-gray-900 text-white p-4 z-20"
      >
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          {!isCollapsed && <h1 className="text-xl font-bold">ThreatGuard Pro</h1>}
        </div>

        <nav className="space-y-2">
          {[
            { icon: Activity, label: "Overview", value: "overview" },
            { icon: AlertTriangle, label: "Threats", value: "threats" },
            { icon: Users, label: "Users", value: "users" },
            { icon: BarChart2, label: "Analytics", value: "analytics" },
            { icon: Terminal, label: "Logs", value: "logs" },
            { icon: Map, label: "Topology", value: "topology" },
            { icon: Settings, label: "Settings", value: "settings" },
          ].map(({ icon: Icon, label, value }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(value)}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors ${
                activeTab === value ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{label}</span>}
            </motion.button>
          ))}
        </nav>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-4 right-4 p-2 bg-gray-800 rounded-full"
        >
          <ChevronDown
            className={`w-4 h-4 transform transition-transform ${
              isCollapsed ? "-rotate-90" : "rotate-90"
            }`}
          />
        </motion.button>

     

      </motion.div>
      

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        } p-8`}
      >
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alerts, users, or activities..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{timeRange}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTimeRange("1h")}>
                  Last Hour
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("24h")}>
                  Last 24 Hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("7d")}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("30d")}>
                  Last 30 Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                onClick={() => document.getElementById("dataset-upload").click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Uploading..." : "Upload Dataset"}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Printer className="w-5 h-5" />
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2"
                  >
                    {notifications.length}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50"
                  >
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-96">
                      {notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border-b hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                notif.severity === "high"
                                  ? "bg-red-100 text-red-800"
                                  : notif.severity === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {notif.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{notif.message}</p>
                        </motion.div>
                      ))}
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Alerts"
            stat={stats.totalAlerts}
            icon={AlertTriangle}
          />
          <StatCard
            label="Critical Threats"
            stat={stats.criticalThreats}
            icon={Shield}
          />
          <StatCard
            label="Active Users"
            stat={stats.activeUsers}
            icon={Users}
          />
          <StatCard
            label="Risk Score"
            stat={stats.averageRiskScore}
            icon={Activity}
          />
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-6 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="topology">Network Topology</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
  <div className="grid grid-cols-2 gap-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Threat Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-hidden">
            <AnomalyChart 
              data={data.http} 
              title="HTTP Anomalies"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>User Activity Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-hidden">
            <AnomalyChart 
              data={data.logon} 
              title="Login Patterns"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-hidden">
            <AnomalyChart 
              data={data.device} 
              title="Device Anomalies"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-hidden">
            <AnomalyChart 
              data={data.network} 
              title="Network Anomalies"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>

  {data.uploaded && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Custom Dataset Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-hidden">
            <AnomalyChart 
              data={data.uploaded} 
              title="Custom Data Analysis"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )}
</TabsContent>

<TabsContent value="threats">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ThreatsList />
        </motion.div>
      </TabsContent>
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <UserManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
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
                            <div className="h-[300px]">
                              <AnomalyChart 
                                data={data.uploaded} 
                                title="Custom Dataset Trends"
                              />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Statistical Overview</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[300px] p-4">
                              <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                  Total Records: {data.uploaded.length}
                                </p>
                                {/* Add more statistical analysis here */}
                              </div>
                            </ScrollArea>
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
            </motion.div>
          </TabsContent>

          <TabsContent value="logs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {/* Add log viewing functionality here */}
                      <p className="text-gray-500">System logs will be displayed here</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="topology">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Network Topology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    {/* Add network topology visualization here */}
                    <p className="text-gray-500">Network topology visualization will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {/* Add settings configuration here */}
                      <p className="text-gray-500">Dashboard settings will be configured here</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;