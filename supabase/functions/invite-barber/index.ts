import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get the manager's user object from the JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError) throw userError;

    // 2. Get the manager's barbershop ID
    const { data: barbershop, error: barbershopError } = await supabaseAdmin
      .from('barbershops')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (barbershopError || !barbershop) throw new Error('Manager or barbershop not found.');
    
    const { email: barberEmail } = await req.json();
    if (!barberEmail) throw new Error('Email is required.');

    // 3. Create a placeholder barber record to get an ID
    const { data: newBarber, error: createBarberError } = await supabaseAdmin
      .from('barbers')
      .insert({ barbershop_id: barbershop.id })
      .select('id')
      .single();
    if (createBarberError) throw createBarberError;

    // 4. Invite the user via email, passing metadata for triggers
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      barberEmail,
      {
        data: { role: 'barbeiro' }, // For the handle_new_user trigger
        app_metadata: { barber_id: newBarber.id } // For the link_barber_on_signup trigger
      }
    );

    if (inviteError) {
      // If invite fails, clean up the placeholder barber record
      await supabaseAdmin.from('barbers').delete().eq('id', newBarber.id);
      if (inviteError.message.includes('User already registered')) {
         return new Response(JSON.stringify({ error: 'Este e-mail já está cadastrado no sistema.' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw inviteError;
    }

    return new Response(JSON.stringify({ message: `Convite enviado para ${barberEmail}` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})