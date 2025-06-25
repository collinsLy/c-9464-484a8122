
import React from 'react';
import { toast } from 'sonner';
import { P2POffer, P2POrder } from '@/lib/p2p-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, CheckCircle } from 'lucide-react';

// Helper component to display payment details
export const PaymentDetails = ({ 
  order, 
  paymentDetails 
}: { 
  order: P2POrder | null, 
  paymentDetails: any 
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!order) return <div>No order selected</div>;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">Payment Details</h3>

        {order.type === 'buy' && (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Method:</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">{order.amount} {order.fiatCurrency}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Reference:</span>
              <div className="flex items-center">
                <span className="font-medium mr-1">{order.referenceNumber?.substring(0, 8)}...</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(order.referenceNumber || '', 'Reference number')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {order.paymentDetails && Object.keys(order.paymentDetails).length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-2">
                {Object.entries(order.paymentDetails).map(([key, value]) => {
                  if (!value || key === 'instructions') return null;
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{value as string}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(value as string, key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {order.paymentDetails?.instructions && (
              <div className="mt-2 border-t pt-2">
                <span className="text-gray-500">Instructions:</span>
                <p className="text-sm mt-1">{order.paymentDetails.instructions}</p>
              </div>
            )}
            
            {(!order.paymentDetails || Object.keys(order.paymentDetails).length === 0) && (
              <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm">The seller hasn't provided payment details. Please use the chat to request them.</p>
              </div>
            )}
          </div>
        )}
        
        {order.type === 'sell' && (
          <div className="text-sm">
            <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded-md">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p>The buyer will pay you {order.amount} {order.fiatCurrency} via {order.paymentMethod}. Once you confirm the payment, the {order.total} {order.crypto} will be released.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format payment details for display
export const formatPaymentDetails = (details: any) => {
  if (!details) return "No payment details available";
  
  const formatted = Object.entries(details)
    .filter(([key, value]) => value && key !== 'instructions')
    .map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedKey}: ${value}`;
    })
    .join('\n');
  
  return formatted || "No payment details available";
};
