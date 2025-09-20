import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, managerName, cnpj, barbershopName } = await req.json()

    // Input validation
    if (!email || !password || !managerName || !cnpj || !barbershopName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Create the user in Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Set to true to send a confirmation email
      user_metadata: {
        full_name: managerName,
        cnpj: cnpj,
        role: 'gestor',
      },
    })

    if (userError) {
      // Handle specific errors like user already exists
      if (userError.message.includes('already registered')) {
        return new Response(JSON.stringify({ error: 'Este e-mail já está cadastrado.' }), {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw userError
    }

    const newUserId = userData.user.id

    // 2. Create the barbershop in the public table
    const { error: barbershopError } = await supabaseAdmin
      .from('barbershops')
      .insert({
        owner_id: newUserId,
        name: barbershopName,
      })

    if (barbershopError) {
      // If barbershop creation fails, delete the created user to keep data consistent
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw barbershopError
    }

    return new Response(JSON.stringify({ message: 'Manager and barbershop created successfully' }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})