import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Phone, Plus } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getPhoneNumbers, PhoneNumberRecord } from '../../api/telephony';

export const PhoneNumbersPage: React.FC = () => {
  const toast = useToast();
  const [numbers, setNumbers] = useState<PhoneNumberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNumbers = async () => {
      setIsLoading(true);
      try {
        const data = await getPhoneNumbers();
        setNumbers(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadNumbers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Telephony Phone Numbers</h2>
          <p className="text-xs text-zinc-400 mt-1">Purchase SIP numbers and route inbound calls directly to voice AI agents.</p>
        </div>
        <Button onClick={() => toast.info('Telephony Trunk Provisioning: Search & purchase new Twilio, Plivo, or SIP numbers.')}>
          <Plus className="w-4 h-4 mr-2" /> Buy Phone Number
        </Button>
      </div>

      {isLoading ? (
        <div className="text-xs text-zinc-400 py-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading phone numbers...
        </div>
      ) : numbers.length === 0 ? (
        <Card className="py-12 px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
            <Phone className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Phone Numbers Assigned</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Connect a Twilio, Plivo, or Indian SIP trunk number to start placing outbound AI campaigns or handling inbound support calls.
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={() => toast.info('Telephony Trunk Provisioning: Search & purchase new Twilio, Plivo, or SIP numbers.')}>
              <Plus className="w-4 h-4 mr-2" /> Buy Phone Number
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {numbers.map((item) => (
            <Card key={item.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{item.phoneNumber}</h3>
                    <p className="text-[11px] text-zinc-400">{item.type || 'Inbound / Outbound'}</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">{item.status}</Badge>
              </div>

              <div className="p-3 bg-[#181922] rounded-xl border border-zinc-800 space-y-1 text-xs">
                <p className="text-zinc-400">Assigned Agent</p>
                <p className="font-bold text-indigo-300">{item.assignedAgentName || 'Unassigned'}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Carrier: {item.provider}</span>
                <span className="text-indigo-400 hover:underline cursor-pointer font-semibold">Change Agent</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
