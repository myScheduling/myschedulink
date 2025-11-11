// /api/webhook/send-to-n8n.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const bookingData = req.body;

        // Στείλε στο n8n webhook
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'new_booking',
                timestamp: new Date().toISOString(),
                booking: {
                    id: bookingData.id,
                    clientName: bookingData.clientName,
                    clientEmail: bookingData.clientEmail,
                    serviceName: bookingData.serviceName,
                    date: bookingData.date,
                    time: bookingData.time,
                    totalPrice: bookingData.totalPrice,
                    status: bookingData.status,
                    businessName: bookingData.businessName,
                    phone: bookingData.phone,
                    address: bookingData.address
                }
            })
        });

        if (!n8nResponse.ok) {
            throw new Error('n8n webhook failed');
        }

        console.log('✅ Booking sent to n8n successfully');
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ n8n webhook error:', error);
        return res.status(500).json({ 
            error: 'Failed to send to n8n', 
            details: error.message 
        });
    }
}