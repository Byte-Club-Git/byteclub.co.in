const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return jsonResponse({ error: "Email is not configured." }, 500);
  }

  let email = "";
  try {
    const body = await request.json();
    email = String(body.email || "").trim().toLowerCase();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!email || !email.includes("@")) {
    return jsonResponse({ error: "Please enter a valid email." }, 400);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Byte Club <info@byteclub.co.in>",
      to: [email],
      subject: "Invitation to Byte.IT2026 - Annual Tech Symposium At BBPS Pitampura",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <p><strong>Byte.IT'26 is here!</strong></p>

          <p>Bal Bharati Public School, Pitampura proudly presents the seventh edition of its annual tech symposium — Byte.IT'26!</p>

          <p>Get ready for an exciting lineup of innovative events, thrilling competitions, and a celebration of technology like never before.</p>

          <p><strong>📅 Event Dates:</strong><br>
          Online: 7th July-12th July 2026<br>
          In-Person: 18th July 2026</p>

          <p><strong>📝 Registration Deadline:</strong> 5th July 2026, 11:59 PM</p>

          <p><strong>📍 Venue for In-Person:</strong> Bal Bharati Public School, Pitampura</p>

          <p><strong>Useful Links:</strong><br>
          Event Invitation: <a href="https://byteclub.co.in/brochure">https://byteclub.co.in/brochure</a><br>
          ATL Brochure: <a href="https://byteclub.co.in/atlbrochure">https://byteclub.co.in/atlbrochure</a><br>
          Registration Form: <a href="https://byteclub.co.in/byteITRegister">https://byteclub.co.in/byteITRegister</a><br>
          Website: <a href="https://byteclub.co.in/">byteclub.co.in</a><br>
          Event Website: <a href="https://byteclub.co.in/byteit">https://byteclub.co.in/byteit</a></p>

          <p><strong>Stay Connected:</strong><br>
          Discord: <a href="https://bit.ly/byteit26discord">https://bit.ly/byteit26discord</a><br>
          WhatsApp Group for Teacher Incharges: <a href="https://bit.ly/byteit26whatsapp">https://bit.ly/byteit26whatsapp</a><br>
          Instagram: <a href="https://instagram.com/bytebbps">https://instagram.com/bytebbps</a></p>

          <p>We look forward to welcoming you to Byte.IT'26 — where tech meets talent!</p>

          <p>Regards,<br>
          Team Byte</p>
        </div>
      `
    })
  });

  if (!resendResponse.ok) {
    const message = await resendResponse.text().catch(() => "");
    return jsonResponse({ error: message || "Email could not be sent." }, 502);
  }

  return jsonResponse({ ok: true });
});
