import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

const ThreatsList = () => {
  const { toast } = useToast();
  const [threats, setThreats] = useState([
    {
      id: 1,
      type: 'Network Intrusion',
      severity: 'high',
      timestamp: '2024-02-17T10:30:00',
      description: 'Unusual network traffic pattern detected from IP 192.168.1.100',
      status: 'active',
      escalated: false
    },
    {
      id: 2,
      type: 'Malware Detection',
      severity: 'high',
      timestamp: '2024-02-17T10:15:00',
      description: 'Potential ransomware activity detected on workstation WS-001',
      status: 'active',
      escalated: false
    },
    {
      id: 3,
      type: 'Failed Login Attempts',
      severity: 'medium',
      timestamp: '2024-02-17T10:00:00',
      description: 'Multiple failed login attempts from user admin',
      status: 'investigating',
      escalated: false
    }
  ]);

  const handleEscalate = (threatId) => {
    setThreats(prevThreats =>
      prevThreats.map(threat =>
        threat.id === threatId
          ? { ...threat, escalated: true }
          : threat
      )
    );

    toast({
      title: "Threat Escalated",
      description: "Alert has been sent to data analysts team",
      duration: 3000,
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-500';
      case 'investigating':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Active Threats
          </CardTitle>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Investigating</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Resolved</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      threat.severity === 'high' ? 'text-red-500' : 
                      threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <h3 className="font-semibold text-gray-900">{threat.type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(threat.status)}`} />
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{threat.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(threat.timestamp)}
                  </div>
                  {threat.severity === 'high' && !threat.escalated && (
                    <Button
                      onClick={() => handleEscalate(threat.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Escalate to Analysts
                    </Button>
                  )}
                  {threat.escalated && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Escalated to analysts</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ThreatsList;