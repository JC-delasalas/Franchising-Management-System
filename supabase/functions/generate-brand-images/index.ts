
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const brandPrompts = {
  'FoodCorp': 'A modern restaurant storefront with warm lighting, showing delicious burgers and food items, professional commercial photography style, inviting atmosphere',
  'RetailPlus': 'A modern retail store interior with clean shelves, technology products, bright lighting, professional commercial space, welcoming shopping environment',
  'ServiceMax': 'A professional service office with modern technology, computers, clean workspace, business consulting environment, professional atmosphere',
  'TechFlow': 'A modern tech company office with computers, servers, digital displays, innovative technology workspace, futuristic and clean design'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { brandName } = await req.json()
    
    if (!brandName || !brandPrompts[brandName as keyof typeof brandPrompts]) {
      return new Response(
        JSON.stringify({ error: 'Invalid brand name' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const prompt = brandPrompts[brandName as keyof typeof brandPrompts]
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        image: data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data[0].url,
        brandName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
