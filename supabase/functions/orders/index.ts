import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MongoClient, ObjectId } from 'https://deno.land/x/mongo@v0.32.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get MongoDB connection
    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(mongoUri);
    const db = client.database('ecommerce');
    const ordersCollection = db.collection('orders');

    // Get Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      client.close();
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const orderId = pathParts[pathParts.length - 1];

    console.log('Orders API called', { method, orderId, userId: user.id });

    // GET user's orders or all orders (admin)
    if (method === 'GET') {
      // Check if user is admin
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdmin = !!roleData;

      if (orderId && orderId !== 'orders') {
        // Get single order
        const query = isAdmin 
          ? { _id: new ObjectId(orderId) }
          : { _id: new ObjectId(orderId), userId: user.id };

        const order = await ordersCollection.findOne(query);
        client.close();
        
        if (!order) {
          return new Response(
            JSON.stringify({ error: 'Order not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(order),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Get all orders (filtered by user if not admin)
        const query = isAdmin ? {} : { userId: user.id };
        const orders = await ordersCollection.find(query).toArray();
        client.close();
        
        return new Response(
          JSON.stringify(orders),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST - Create new order
    if (method === 'POST') {
      const orderData = await req.json();
      const result = await ordersCollection.insertOne({
        ...orderData,
        userId: user.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      client.close();

      return new Response(
        JSON.stringify({ id: result.toString(), ...orderData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT - Update order (admin only)
    if (method === 'PUT') {
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        client.close();
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const orderData = await req.json();
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { ...orderData, updatedAt: new Date() } }
      );

      client.close();

      return new Response(
        JSON.stringify({ id: orderId, ...orderData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    client.close();
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Orders API error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
