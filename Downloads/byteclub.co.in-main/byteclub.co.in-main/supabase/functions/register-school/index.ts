import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { schoolName, schoolEmail } = await request.json();
    if (!schoolName || !schoolEmail) {
      throw new Error("School name and email are required.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("REGISTRATION_FROM_EMAIL");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server environment is not configured.");
    }

    if (!resendApiKey || !fromEmail) {
      throw new Error("Email provider environment is not configured.");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const password = generatePassword();
    const normalizedEmail = String(schoolEmail).trim().toLowerCase();

    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { school_name: schoolName }
    });

    if (createUserError) throw createUserError;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Your Byte.IT school dashboard password",
        text: `Your Byte.IT registration account is ready.\n\nSchool: ${schoolName}\nEmail: ${normalizedEmail}\nPassword: ${password}\n\nLogin at your website's /login.html page and change this password after your first login if required.`
      })
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Resend email error:", emailError);
      await admin.auth.admin.deleteUser(createdUser.user.id);
      throw new Error(`School account was created, but the password email could not be sent. Resend said: ${emailError}`);
    }

    const { error: schoolError } = await admin.from("schools").insert({
      user_id: createdUser.user.id,
      name: schoolName,
      email: normalizedEmail
    });

    if (schoolError) {
      await admin.auth.admin.deleteUser(createdUser.user.id);
      throw schoolError;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Registration failed." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
